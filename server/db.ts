import { eq } from "drizzle-orm";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, User, users as mysqlUsers } from "../drizzle/schema";
import { users as postgresUsers } from "../drizzle/pg-schema";
import { ENV } from "./_core/env";

// Keep the existing MySQL path as the safe default. PostgreSQL is opt-in only
// after the independent schema and environment have passed acceptance checks.
type Database = ReturnType<typeof drizzleMysql>;
let _db: Database | null = null;
let _pool: Pool | null = null;
let _dbMode: "mysql" | "postgres" | null = null;

type AdapterEnvironment = {
  B2RENT_VERCEL_ADAPTERS_READY?: string;
  SUPABASE_DB_URL?: string;
};

export function shouldUsePostgresAdapter(env: AdapterEnvironment = process.env as AdapterEnvironment) {
  return env.B2RENT_VERCEL_ADAPTERS_READY === "true" && Boolean(env.SUPABASE_DB_URL?.trim());
}

function postgresAdapterEnabled() {
  return shouldUsePostgresAdapter({
    B2RENT_VERCEL_ADAPTERS_READY: ENV.vercelAdaptersReady ? "true" : "false",
    SUPABASE_DB_URL: ENV.supabaseDbUrl,
  });
}

function createPostgresDb(): Database {
  if (!_pool) {
    _pool = new Pool({
      connectionString: ENV.supabaseDbUrl,
      max: 5,
      connectionTimeoutMillis: 15_000,
      idleTimeoutMillis: 30_000,
      ssl: { rejectUnauthorized: false },
    });
  }
  return drizzlePostgres(_pool) as unknown as Database;
}

// Lazily create the selected Drizzle instance so local tooling can run without a DB.
export async function getDb() {
  const usePostgres = postgresAdapterEnabled();
  const requestedMode = usePostgres ? "postgres" : "mysql";

  if (_db && _dbMode === requestedMode) return _db;
  if (_db && _dbMode !== requestedMode) {
    _db = null;
    _dbMode = null;
  }

  try {
    if (usePostgres) {
      _db = createPostgresDb();
      _dbMode = "postgres";
    } else if (ENV.databaseUrl) {
      _db = drizzleMysql(ENV.databaseUrl);
      _dbMode = "mysql";
    }
  } catch (error) {
    console.warn(`[Database] Failed to initialize ${requestedMode} adapter:`, error);
    _db = null;
    _dbMode = null;
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    if (user.name !== undefined) {
      values.name = user.name;
      updateSet.name = user.name;
    }
    if (user.email !== undefined) {
      values.email = user.email;
      updateSet.email = user.email;
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.legalConsentVersion !== undefined) {
      values.legalConsentVersion = user.legalConsentVersion;
      updateSet.legalConsentVersion = user.legalConsentVersion;
    }
    if (user.legalConsentAt !== undefined) {
      values.legalConsentAt = user.legalConsentAt;
      updateSet.legalConsentAt = user.legalConsentAt;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    if (_dbMode === "postgres") {
      const pgValues = {
        openId: values.openId,
        name: values.name,
        email: values.email,
        lastSignedIn: values.lastSignedIn,
        legalConsentVersion: values.legalConsentVersion,
        legalConsentAt: values.legalConsentAt,
        role: values.role,
      };
      const pgUpdateSet = {
        ...(updateSet.name !== undefined ? { name: updateSet.name } : {}),
        ...(updateSet.email !== undefined ? { email: updateSet.email } : {}),
        ...(updateSet.lastSignedIn !== undefined ? { lastSignedIn: updateSet.lastSignedIn } : {}),
        ...(updateSet.legalConsentVersion !== undefined ? { legalConsentVersion: updateSet.legalConsentVersion } : {}),
        ...(updateSet.legalConsentAt !== undefined ? { legalConsentAt: updateSet.legalConsentAt } : {}),
        ...(updateSet.role !== undefined ? { role: updateSet.role } : {}),
      };
      await (db as any).insert(postgresUsers).values(pgValues).onConflictDoUpdate({
        target: postgresUsers.openId,
        set: pgUpdateSet,
      });
      return;
    }

    await db.insert(mysqlUsers).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  if (_dbMode === "postgres") {
    const result = await (db as any).select().from(postgresUsers).where(eq(postgresUsers.openId, openId)).limit(1);
    return result.length > 0 ? (result[0] as User) : undefined;
  }

  const result = await db.select().from(mysqlUsers).where(eq(mysqlUsers.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
