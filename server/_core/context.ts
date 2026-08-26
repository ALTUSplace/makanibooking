import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { authenticateSupabaseRequest, isSupabaseAuthEnabled } from "./supabaseAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = isSupabaseAuthEnabled()
      ? await authenticateSupabaseRequest(opts.req)
      : await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures. Invalid or expired
    // Supabase tokens simply produce an anonymous request.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
