import { Pool, type PoolConfig } from "pg";

export function getSupabaseHealthServiceName(runtimeTarget: string | undefined): string {
  return runtimeTarget === "vercel" ? "b2-rent-supabase-production" : "b2-rent-supabase-preview";
}

export type SupabasePreviewHealth = {
  configured: boolean;
  ready: boolean;
  status: "not_configured" | "ready" | "schema_unavailable" | "unavailable";
};

type QueryResult = { rows: Array<{ schema_present?: boolean }> };
type QueryClient = {
  query: (sql: string) => Promise<QueryResult>;
  end: () => Promise<void>;
};

type ClientFactory = (config: PoolConfig) => QueryClient;

const b2RentSchemaQuery =
  "SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'b2rent') AS schema_present";

function defaultClientFactory(config: PoolConfig): QueryClient {
  return new Pool(config);
}

function logSafeConnectionFailure(error: unknown): void {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const errorCode =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : "unknown";

  console.warn("[Supabase preview health] database check failed", { errorName, errorCode });
}

export async function inspectSupabasePreview(
  connectionString = process.env.SUPABASE_DB_URL?.trim(),
  createClient: ClientFactory = defaultClientFactory,
): Promise<SupabasePreviewHealth> {
  if (!connectionString?.startsWith("postgres")) {
    return { configured: false, ready: false, status: "not_configured" };
  }

  const client = createClient({
    connectionString,
    connectionTimeoutMillis: 5_000,
    max: 1,
    statement_timeout: 5_000,
  });

  try {
    const result = await client.query(b2RentSchemaQuery);
    if (result.rows[0]?.schema_present) {
      return { configured: true, ready: true, status: "ready" };
    }

    return { configured: true, ready: false, status: "schema_unavailable" };
  } catch (error) {
    logSafeConnectionFailure(error);
    return { configured: true, ready: false, status: "unavailable" };
  } finally {
    await client.end().catch(() => undefined);
  }
}
