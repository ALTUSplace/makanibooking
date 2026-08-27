import { createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import mysql from "mysql2/promise";

const outputDir = "/home/ubuntu/makanibooking-backups";
const outputFile = join(outputDir, `mysql-readonly-snapshot-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.jsonl.gz`);
await mkdir(outputDir, { recursive: true, mode: 0o700 });
const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  connectTimeout: 10_000,
  ssl: { rejectUnauthorized: true },
});
const output = createWriteStream(outputFile, { mode: 0o600 });
const gzip = createGzip({ level: 9 });
gzip.pipe(output);
const write = value => gzip.write(`${JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item)}\n`);
try {
  write({ type: "manifest", createdAt: new Date().toISOString(), sourceUnchanged: true, format: "jsonl-v1" });
  const [tables] = await connection.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
  const tableKey = Object.keys(tables[0] ?? {}).find(key => key.toLowerCase().includes("tables_in_"));
  const counts = [];
  for (const entry of tables) {
    const table = entry[tableKey];
    const safeTable = String(table).replaceAll("`", "``");
    const [columns] = await connection.query(`SHOW COLUMNS FROM \`${safeTable}\``);
    const [rows] = await connection.query(`SELECT * FROM \`${safeTable}\``);
    counts.push({ table, rows: rows.length, columns: columns.length });
    write({ type: "table", table, columns: columns.map(column => column.Field), rows });
  }
  write({ type: "summary", tableCount: counts.length, counts, sourceUnchanged: true });
  gzip.end();
  await new Promise((resolve, reject) => { output.on("close", resolve); output.on("error", reject); });
  console.log(JSON.stringify({ status: "snapshot-created", file: outputFile, tables: counts.length, counts, sourceUnchanged: true }, null, 2));
} finally {
  await connection.end();
}
