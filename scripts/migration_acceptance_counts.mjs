import mysql from "mysql2/promise";
import pg from "pg";

const { Pool } = pg;
const tables = [
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

const quoteMySql = name => `\`${name.replaceAll("`", "``")}\``;
const quotePg = name => `"${name.replaceAll('"', '""')}"`;
const safeError = error => error instanceof Error ? error.message.replace(/(postgres(?:ql)?|mysql):\/\/[^\s]+/gi, "[redacted]") : String(error);

const mysqlDb = await mysql.createConnection({ uri: process.env.DATABASE_URL, connectTimeout: 10_000, ssl: { rejectUnauthorized: true } });
const pgPool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, connectionTimeoutMillis: 10_000, max: 1, ssl: { rejectUnauthorized: false } });

try {
  const results = [];
  for (const table of tables) {
    const [[mysqlCount]] = await mysqlDb.query(`SELECT COUNT(*) AS count FROM ${quoteMySql(table)}`);
    const pgResult = await pgPool.query(`SELECT COUNT(*)::bigint AS count FROM public.${quotePg(table)}`);
    results.push({ table, mysql: Number(mysqlCount.count), postgres: Number(pgResult.rows[0].count), equal: Number(mysqlCount.count) === Number(pgResult.rows[0].count) });
  }

  const [mysqlForeignKeys] = await mysqlDb.query(
    `SELECT COUNT(*) AS count FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE()`,
  );
  const pgForeignKeys = await pgPool.query(
    `SELECT COUNT(*)::bigint AS count FROM information_schema.table_constraints WHERE constraint_schema = 'public' AND constraint_type = 'FOREIGN KEY'`,
  );

  console.log(JSON.stringify({
    status: "read-only-counts-and-relations-audit",
    tables: results,
    mismatches: results.filter(row => !row.equal),
    foreignKeys: { mysql: Number(mysqlForeignKeys[0].count), postgres: Number(pgForeignKeys.rows[0].count) },
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: "error", message: safeError(error) }));
  process.exitCode = 1;
} finally {
  await mysqlDb.end().catch(() => {});
  await pgPool.end().catch(() => {});
}
