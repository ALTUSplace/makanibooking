import fs from "node:fs/promises";
import pg from "pg";

const { Pool } = pg;
const sql = await fs.readFile(new URL("./supabase_schema_acceptance.sql", import.meta.url), "utf8");
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  connectionTimeoutMillis: 15_000,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('users','listings','listing_analytics_events','bookings','reviews','kyc_submissions','payments','commercial_lease_contracts','notifications','booking_messages','audit_logs','refund_requests','platform_settings','payout_requests','booking_vouchers','invoices','disputes','dispute_attachments','support_tickets')
    ORDER BY table_name
  `);
  console.log(JSON.stringify({ status: "schema-applied-no-data-migration", tables: result.rows.map((row) => row.table_name) }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: "schema-apply-failed", message: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
} finally {
  await pool.end();
}
