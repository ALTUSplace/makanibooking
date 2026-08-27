import { createWriteStream } from "node:fs";
import { chmod, mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { URL } from "node:url";

const outputDir = "/home/ubuntu/makanibooking-backups";
const outputFile = join(outputDir, `mysql-before-supabase-cutover-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.sql.gz`);
const uri = new URL(process.env.DATABASE_URL);
const tempDir = await mkdtemp(join(tmpdir(), "makanibooking-mysql-backup-"));
const defaultsFile = join(tempDir, "client.cnf");
const config = `[client]\nhost=${uri.hostname}\nport=${uri.port || "3306"}\nuser=${decodeURIComponent(uri.username)}\npassword=${decodeURIComponent(uri.password)}\n`;

await mkdir(outputDir, { recursive: true, mode: 0o700 });
await writeFile(defaultsFile, config, { mode: 0o600 });
await chmod(defaultsFile, 0o600);

const args = [
  `--defaults-extra-file=${defaultsFile}`,
  "--single-transaction",
  "--skip-lock-tables",
  "--routines",
  "--events",
  "--triggers",
  uri.pathname.replace(/^\//, ""),
];
const dump = spawn("mysqldump", args, { stdio: ["ignore", "pipe", "pipe"] });
const gzip = spawn("gzip", ["-c"], { stdio: ["pipe", "pipe", "pipe"] });
dump.stdout.pipe(gzip.stdin);
gzip.stdout.pipe(createWriteStream(outputFile, { mode: 0o600 }));

let stderr = "";
dump.stderr.on("data", chunk => { stderr += chunk.toString(); });
gzip.stderr.on("data", chunk => { stderr += chunk.toString(); });
const dumpCode = await new Promise(resolve => dump.on("close", resolve));
const gzipCode = await new Promise(resolve => gzip.on("close", resolve));
await rm(tempDir, { recursive: true, force: true });

if (dumpCode !== 0 || gzipCode !== 0) {
  await rm(outputFile, { force: true });
  const safeDiagnostic = stderr
    .replace(/mysql:\s*\[[^\]]+\]\s*/g, "")
    .replace(/password\s*=\s*\S+/gi, "password=<redacted>")
    .replace(/user\s*=\s*\S+/gi, "user=<redacted>")
    .replace(/@[A-Za-z0-9._:-]+/g, "@<redacted>")
    .trim()
    .slice(0, 500);
  console.error(JSON.stringify({
    status: "backup-failed",
    dumpCode,
    gzipCode,
    diagnosticType: stderr.includes("Access denied") ? "credentials-or-permissions" : "connection-or-dump-error",
    diagnostic: safeDiagnostic,
  }));
  process.exit(1);
}

const outputStat = await stat(outputFile);
console.log(JSON.stringify({
  status: "backup-created",
  file: outputFile,
  bytes: outputStat.size,
  sourceUnchanged: true,
  restoreCommand: `gzip -dc ${outputFile} | mysql --defaults-extra-file=<restore-client.cnf>`,
}, null, 2));
