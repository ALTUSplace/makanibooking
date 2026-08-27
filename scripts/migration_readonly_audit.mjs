import mysql from "mysql2/promise";
import pg from "pg";

const { Pool } = pg;
const expectedTables = [
  "users",
  "listings",
  "listing_analytics_events",
  "bookings",
  "reviews",
  "kyc_submissions",
  "payments",
  "commercial_lease_contracts",
  "notifications",
  "booking_messages",
  "audit_logs",
  "refund_requests",
  "platform_settings",
  "payout_requests",
  "booking_vouchers",
  "invoices",
  "disputes",
  "dispute_attachments",
  "support_tickets",
];

function safeError(error) {
  return error instanceof Error ? error.message.replace(/(postgres(?:ql)?|mysql):\/\/[^\s]+/gi, "[redacted]") : String(error);
}

const mysqlDb = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  connectTimeout: 10_000,
  ssl: { rejectUnauthorized: true },
});
const pgPool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  connectionTimeoutMillis: 10_000,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

try {
  const [mysqlRows] = await mysqlDb.query(
    `SELECT table_name AS tableName, table_rows AS estimatedRows
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
     ORDER BY table_name`,
  );
  const pgResult = await pgPool.query(
    `SELECT table_name AS "tableName"
     FROM information_schema.tables
     WHERE table_schema = 'public'
     ORDER BY table_name`,
  );
  const mysqlTables = new Set(mysqlRows.map((row) => row.tableName));
  const pgTables = new Set(pgResult.rows.map((row) => row.tableName));
  const present = expectedTables.map((tableName) => ({
    tableName,
    mysql: mysqlTables.has(tableName),
    postgres: pgTables.has(tableName),
  }));
  console.log(JSON.stringify({
    status: "read-only-schema-audit",
    mysqlTableCount: mysqlTables.size,
    postgresPublicTableCount: pgTables.size,
    expected: present,
    mysqlOnly: [...mysqlTables].filter((name) => !pgTables.has(name)).sort(),
    postgresOnly: [...pgTables].filter((name) => !mysqlTables.has(name)).sort(),
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: "error", message: safeError(error) }));
  process.exitCode = 1;
} finally {
  await mysqlDb.end().catch(() => {});
  await pgPool.end().catch(() => {});
}
