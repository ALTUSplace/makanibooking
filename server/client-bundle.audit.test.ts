import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

describe("production client bundle safety", () => {
  it("keeps the React runtime in one framework chunk", () => {
    const viteConfig = readFileSync(resolve(root, "vite.config.ts"), "utf8");

    expect(viteConfig).toContain('return "framework-vendor"');
    expect(viteConfig).not.toContain('return "react-vendor"');
    expect(viteConfig).not.toContain('return "react-dom-vendor"');
    expect(viteConfig).not.toContain("onlyExplicitManualChunks: true");
  });

  it("runs client bundle verification as part of the production build", () => {
    const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

    expect(existsSync(resolve(root, "scripts/verify-client-bundle.mjs"))).toBe(true);
    expect(packageJson.scripts["verify:client-bundle"]).toBe(
      "node scripts/verify-client-bundle.mjs",
    );
    expect(packageJson.scripts.build).toContain("pnpm verify:client-bundle");
  });
});
