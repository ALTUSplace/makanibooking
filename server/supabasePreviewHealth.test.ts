import { once } from "node:events";
import { createApp } from "./_core/app";
import { afterEach, describe, expect, it, vi } from "vitest";
import { inspectSupabasePreview } from "./_core/supabasePreviewHealth";

describe("Supabase Preview health", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not create a client when no PostgreSQL connection is configured", async () => {
    const createClient = vi.fn();

    await expect(inspectSupabasePreview("", createClient)).resolves.toEqual({
      configured: false,
      ready: false,
      status: "not_configured",
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("reports ready after a read-only schema check", async () => {
    const end = vi.fn().mockResolvedValue(undefined);
    const query = vi.fn().mockResolvedValue({ rows: [{ schema_present: true }] });

    await expect(
      inspectSupabasePreview("postgresql://preview.example.test/db", () => ({ query, end })),
    ).resolves.toEqual({ configured: true, ready: true, status: "ready" });
    expect(query).toHaveBeenCalledWith(expect.stringContaining("information_schema.schemata"));
    expect(end).toHaveBeenCalledOnce();
  });

  it("never throws connection errors or exposes a connection string", async () => {
    const end = vi.fn().mockResolvedValue(undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    try {
      await expect(
        inspectSupabasePreview("postgresql://secret.example.test/db", () => ({
          query: vi.fn().mockRejectedValue(new Error("connection refused")),
          end,
        })),
      ).resolves.toEqual({ configured: true, ready: false, status: "unavailable" });
      expect(end).toHaveBeenCalledOnce();
      expect(warn).toHaveBeenCalledWith("[Supabase preview health] database check failed", {
        errorName: "Error",
        errorCode: "unknown",
      });
      expect(JSON.stringify(warn.mock.calls)).not.toMatch(/secret|connection refused/i);
    } finally {
      warn.mockRestore();
    }
  });

  it("serves the safe Supabase status at the documented API health route", async () => {
    vi.stubEnv("SUPABASE_DB_URL", "");
    const server = createApp().listen(0);
    await once(server, "listening");

    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Test server did not expose a port");

      const response = await fetch(`http://127.0.0.1:${address.port}/api/health/supabase`);
      const payload = await response.json();

      expect(response.status).toBe(503);
      expect(payload).toEqual({
        ok: false,
        service: "b2-rent-supabase-preview",
        configured: false,
        status: "not_configured",
      });
      expect(JSON.stringify(payload)).not.toMatch(/postgres|password|secret/i);
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
