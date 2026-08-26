import type { Request } from "express";
import { createClient, type User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "../../drizzle/schema";
import { getUserByOpenId, upsertUser } from "../db";
import { ENV } from "./env";

let adminClient: ReturnType<typeof createClient> | null = null;

export function isSupabaseAuthEnabled() {
  return ENV.authProvider === "supabase";
}

function getAdminClient() {
  if (!ENV.supabaseUrl) return null;
  const key = ENV.supabaseServiceRoleKey || ENV.supabaseAnonKey;
  if (!key) return null;
  if (!adminClient) {
    adminClient = createClient(ENV.supabaseUrl, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return adminClient;
}

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

function getDisplayName(user: SupabaseUser) {
  const metadata = user.user_metadata ?? {};
  const candidate = metadata.full_name ?? metadata.name ?? metadata.display_name;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : user.email ?? null;
}

function isConfiguredAdmin(user: SupabaseUser) {
  const configuredIds = ENV.supabaseAdminUserIds
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
  return configuredIds.includes(user.id);
}

/**
 * Validates a Supabase access token with Supabase Auth and maps it to the
 * application's existing user row. The browser never receives the service role
 * key, and role changes are controlled by server configuration/database only.
 */
export async function authenticateSupabaseRequest(req: Request): Promise<User | null> {
  const token = getBearerToken(req);
  const client = getAdminClient();
  if (!token || !client) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;

  const authUser = data.user;
  const existing = await getUserByOpenId(authUser.id);
  if (existing) return existing;

  await upsertUser({
    openId: authUser.id,
    name: getDisplayName(authUser),
    email: authUser.email ?? null,
    loginMethod: "supabase",
    role: isConfiguredAdmin(authUser) ? "admin" : "user",
    lastSignedIn: new Date(),
  });

  return (await getUserByOpenId(authUser.id)) ?? null;
}
