import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const outputDir = resolve(process.argv[2] ?? "dist/public");
const assetsDir = resolve(outputDir, "assets");
const maxBytes = 500_000;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolutePath)));
    else files.push(absolutePath);
  }
  return files;
}

const files = (await walk(assetsDir)).filter((file) => file.endsWith(".js"));
if (files.length === 0) {
  throw new Error(`No client JavaScript assets found in ${assetsDir}`);
}

const sizedFiles = await Promise.all(
  files.map(async (file) => ({ file, bytes: (await stat(file)).size })),
);
const oversized = sizedFiles.filter(({ bytes }) => bytes >= maxBytes);
if (oversized.length > 0) {
  const details = oversized
    .map(({ file, bytes }) => `${file.replace(`${outputDir}/`, "")}=${bytes} bytes`)
    .join(", ");
  throw new Error(`Client JavaScript chunks must be < ${maxBytes} bytes: ${details}`);
}

const frameworkChunks = sizedFiles.filter(({ file }) => /framework-vendor-.*\.js$/.test(file));
if (frameworkChunks.length !== 1) {
  throw new Error(`Expected exactly one framework-vendor chunk, found ${frameworkChunks.length}`);
}

const forbiddenSeparateReactChunks = sizedFiles.filter(({ file }) =>
  /(?:react-vendor|react-dom-vendor)-.*\.js$/.test(file),
);
if (forbiddenSeparateReactChunks.length > 0) {
  throw new Error(
    `React runtime must stay in framework-vendor; found separate chunks: ${forbiddenSeparateReactChunks
      .map(({ file }) => file.replace(`${outputDir}/`, ""))
      .join(", ")}`,
  );
}

const largest = [...sizedFiles].sort((a, b) => b.bytes - a.bytes).slice(0, 5);
console.log("Client bundle verification passed.");
for (const { file, bytes } of largest) {
  console.log(`- ${file.replace(`${outputDir}/`, "")}: ${bytes} bytes`);
}
