import { createClient } from "@supabase/supabase-js";

const REMEMBER_SESSION_KEY = "makani.rememberSession";

export function isValidSupabaseUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function getStorage(kind: "local" | "session") {
  if (typeof window === "undefined") return null;
  return kind === "local" ? window.localStorage : window.sessionStorage;
}

export function getRememberMePreference() {
  const storage = getStorage("local");
  return storage?.getItem(REMEMBER_SESSION_KEY) !== "false";
}

export function setRememberMePreference(remember: boolean) {
  const storage = getStorage("local");
  if (!storage) return;
  storage.setItem(REMEMBER_SESSION_KEY, String(remember));
}

function clearStoredSupabaseSessions() {
  for (const kind of ["local", "session"] as const) {
    const storage = getStorage(kind);
    if (!storage) continue;
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith("sb-") && key.endsWith("-auth-token")) storage.removeItem(key);
    }
  }
}

const supabaseStorage = {
  getItem(key: string) {
    return getStorage(getRememberMePreference() ? "local" : "session")?.getItem(key) ?? null;
  },
  setItem(key: string, value: string) {
    getStorage(getRememberMePreference() ? "local" : "session")?.setItem(key, value);
  },
  removeItem(key: string) {
    getStorage("local")?.removeItem(key);
    getStorage("session")?.removeItem(key);
  },
};

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
        storage: supabaseStorage,
        detectSessionInUrl: true,
      },
    })
  : null;

export function prepareRememberedLogin(remember: boolean) {
  setRememberMePreference(remember);
  if (!remember) clearStoredSupabaseSessions();
}

export function isSupabaseAuthConfigured() {
  return Boolean(supabase);
}

export async function getSupabaseAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
