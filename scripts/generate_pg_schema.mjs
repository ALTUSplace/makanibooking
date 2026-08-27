import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../drizzle/schema.ts", import.meta.url);
const targetPath = new URL("../drizzle/pg-schema.ts", import.meta.url);
let source = await readFile(sourcePath, "utf8");

source = source
  .replace(
    /import \{[^}]+\} from "drizzle-orm\/mysql-core";/,
    'import { boolean, integer, pgSchema, text, timestamp, varchar, index, uniqueIndex } from "drizzle-orm/pg-core";',
  )
  .replace(/mysqlTable\(/g, "b2rent.table(")
  .replace(/\bint\(/g, "integer(")
  .replace(/\.autoincrement\(\)/g, ".generatedAlwaysAsIdentity()")
  .replace(/\.onUpdateNow\(\)/g, "")
  .replace(/mysqlEnum\("([^"]+)",\s*\[[^\]]*\]\)/g, 'text("$1")')
  .replace(/"([A-Za-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*)"/g, (_match, name) =>
    `"${name.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}"`,
  );

if (source.includes("mysqlTable") || source.includes("mysqlEnum") || source.includes("autoincrement") || source.includes("onUpdateNow")) {
  throw new Error("PG schema transformation left MySQL-only constructs");
}

source = `// Generated from drizzle/schema.ts for the opt-in Supabase PostgreSQL adapter.\n// Enums remain text columns because supabase/migrations/0001_b2rent_schema.sql\n// enforces the allowed values with CHECK constraints. Do not edit manually.\n${source.replace(/^\s*/, "")}\nconst b2rent = pgSchema("b2rent");\n`;

// The schema declaration must precede table declarations.
source = source.replace(/(from "drizzle-orm\/pg-core";\n)/, '$1\nconst b2rent = pgSchema("b2rent");\n');
source = source.replace(/\nconst b2rent = pgSchema\("b2rent"\);\n$/, "\n");

await writeFile(targetPath, source);
console.log(`Generated ${targetPath.pathname}`);
