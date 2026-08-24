import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(scriptsDirectory, "..");
const bundlePath = resolve(projectRoot, "api/_generated/app.cjs");

if (!existsSync(bundlePath)) {
  throw new Error("Vercel server bundle was not generated before verification.");
}

const bundleSource = readFileSync(bundlePath, "utf8");
if (/require\(["']jose["']\)/.test(bundleSource)) {
  throw new Error("Vercel server bundle leaves jose as a CommonJS require, which fails at runtime.");
}

const require = createRequire(import.meta.url);
const serverBundle = require(bundlePath);

if (typeof serverBundle.createApp !== "function") {
  throw new Error("Vercel server bundle does not export createApp().");
}

const app = serverBundle.createApp();

if (typeof app !== "function") {
  throw new Error("Vercel server bundle did not create an Express application.");
}

console.log("Vercel server bundle loaded and created an Express application successfully.");
