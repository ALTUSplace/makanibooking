import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

describe("Vercel deployment boundary", () => {
  it("exports one reusable Express API app for local and Vercel runtimes", () => {
    const appSource = readFileSync(resolve(root, "server/_core/app.ts"), "utf8");
    const entrySource = readFileSync(resolve(root, "api/index.ts"), "utf8");

    expect(appSource).toContain("export function createApp");
    expect(appSource).toContain('app.set("trust proxy", 1)');
    expect(appSource).toContain('"/api/trpc"');
    expect(entrySource).toContain("export default app");
    expect(entrySource).toContain("createRequire");
    expect(entrySource).toContain('require("./_generated/app.cjs")');
  });

  it("builds the server as a CJS bundle and includes required function files", () => {
    const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    const config = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));

    expect(packageJson.scripts.build).toContain("pnpm build:vercel-api");
    expect(packageJson.scripts.build).toContain("pnpm verify:vercel-api");
    expect(packageJson.scripts["build:vercel-api"]).toContain("server/_core/app.ts");
    expect(packageJson.scripts["build:vercel-api"]).toContain("--format=cjs");
    expect(packageJson.scripts["build:vercel-api"]).not.toContain("--packages=external");
    expect(packageJson.scripts["verify:vercel-api"]).toBe("node scripts/verify-vercel-api.mjs");
    expect(config.functions["api/index.ts"].includeFiles).toBe(
      "{api/_generated/**,server/assets/DejaVuSans.ttf}",
    );
  });

  it("routes Vercel API traffic to the serverless app and keeps the Vite output", () => {
    const config = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));

    expect(config.outputDirectory).toBe("dist/public");
    expect(config.rewrites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/api/(.*)", destination: "/api/index" }),
        expect.objectContaining({ source: "/manus-storage/(.*)", destination: "/api/index" }),
      ]),
    );
  });
});
