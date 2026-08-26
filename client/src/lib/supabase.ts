import { createClient } from "@supabase/supabase-js";

export function isValidSupabaseUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const hasValidSupabaseConfig = isValidSupabaseUrl(supabaseUrl) && Boolean(supabaseAnonKey?.trim());

if (supabaseUrl && !isValidSupabaseUrl(supabaseUrl)) {
  console.warn("[Supabase] Ignoring invalid VITE_SUPABASE_URL; authentication UI remains available.");
}

export const supabase = hasValidSupabaseConfig
  ? createClient(supabaseUrl!.trim(), supabaseAnonKey!.trim(), {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function isSupabaseAuthConfigured() {
  return Boolean(supabase);
}

export async function getSupabaseAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
