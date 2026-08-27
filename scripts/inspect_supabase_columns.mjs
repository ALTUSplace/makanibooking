import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false }, max: 1 });
try {
  const { rows } = await pool.query(`SELECT table_name, column_name, data_type, is_nullable, column_default, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name IN ('bookings','audit_logs')
    ORDER BY table_name, ordinal_position`);
  console.log(JSON.stringify({ status: "read-only", rows }, null, 2));
} finally { await pool.end(); }
