import { ENV } from "./env";

type RuntimeEnvironment = Pick<
  typeof ENV,
  | "runtimeTarget"
  | "databaseUrl"
  | "cookieSecret"
  | "appId"
  | "oAuthServerUrl"
  | "forgeApiUrl"
  | "forgeApiKey"
  | "supabaseUrl"
  | "supabaseDbUrl"
  | "supabaseServiceRoleKey"
  | "authRedirectUri"
  | "emailProviderApiKey"
  | "emailFromAddress"
  | "visionProviderApiKey"
  | "cronSecret"
  | "vercelAdaptersReady"
>;

type RequiredService = { key: string; isConfigured: (env: RuntimeEnvironment) => boolean };

const MANUS_REQUIRED_SERVICES: RequiredService[] = [
  { key: "DATABASE_URL", isConfigured: env => Boolean(env.databaseUrl) },
  { key: "JWT_SECRET", isConfigured: env => Boolean(env.cookieSecret) },
  { key: "VITE_APP_ID", isConfigured: env => Boolean(env.appId) },
  { key: "OAUTH_SERVER_URL", isConfigured: env => Boolean(env.oAuthServerUrl) },
  { key: "BUILT_IN_FORGE_API_URL", isConfigured: env => Boolean(env.forgeApiUrl) },
  { key: "BUILT_IN_FORGE_API_KEY", isConfigured: env => Boolean(env.forgeApiKey) },
];

const VERCEL_REQUIRED_SERVICES: RequiredService[] = [
  { key: "SUPABASE_URL", isConfigured: env => Boolean(env.supabaseUrl) },
  { key: "SUPABASE_DB_URL", isConfigured: env => Boolean(env.supabaseDbUrl) },
  { key: "SUPABASE_SERVICE_ROLE_KEY", isConfigured: env => Boolean(env.supabaseServiceRoleKey) },
  { key: "JWT_SECRET", isConfigured: env => Boolean(env.cookieSecret) },
  { key: "B2RENT_VERCEL_ADAPTERS_READY", isConfigured: env => env.vercelAdaptersReady },
];

/**
 * Reports whether runtime-only services are configured without ever exposing
 * values. This is safe for a public operational endpoint.
 */
export function getRuntimeReadiness(env: RuntimeEnvironment = ENV) {
  const services = env.runtimeTarget === "vercel" ? VERCEL_REQUIRED_SERVICES : MANUS_REQUIRED_SERVICES;
  const missing = services.filter(service => !service.isConfigured(env)).map(service => service.key);

  return {
    ready: missing.length === 0,
    target: env.runtimeTarget === "vercel" ? "vercel" : "manus",
    missing,
  };
}
