import { ENV } from "./env";

type RuntimeEnvironment = Pick<
  typeof ENV,
  "databaseUrl" | "cookieSecret" | "appId" | "oAuthServerUrl" | "forgeApiUrl" | "forgeApiKey"
>;

const REQUIRED_SERVICES: Array<{ key: string; isConfigured: (env: RuntimeEnvironment) => boolean }> = [
  { key: "DATABASE_URL", isConfigured: env => Boolean(env.databaseUrl) },
  { key: "JWT_SECRET", isConfigured: env => Boolean(env.cookieSecret) },
  { key: "VITE_APP_ID", isConfigured: env => Boolean(env.appId) },
  { key: "OAUTH_SERVER_URL", isConfigured: env => Boolean(env.oAuthServerUrl) },
  { key: "BUILT_IN_FORGE_API_URL", isConfigured: env => Boolean(env.forgeApiUrl) },
  { key: "BUILT_IN_FORGE_API_KEY", isConfigured: env => Boolean(env.forgeApiKey) },
];

/**
 * Reports whether runtime-only services are configured without ever exposing
 * values. This is safe for a public operational endpoint.
 */
export function getRuntimeReadiness(env: RuntimeEnvironment = ENV) {
  const missing = REQUIRED_SERVICES.filter(service => !service.isConfigured(env)).map(service => service.key);

  return {
    ready: missing.length === 0,
    missing,
  };
}
