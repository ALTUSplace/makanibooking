import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  connectTimeout: 15_000,
  ssl: { rejectUnauthorized: true },
});
try {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME AS column_name, DATA_TYPE AS data_type, IS_NULLABLE AS is_nullable
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'bookings'
     ORDER BY ORDINAL_POSITION`,
  );
  console.log(JSON.stringify({ status: "read-only", rows }, null, 2));
} finally {
  await connection.end();
}
