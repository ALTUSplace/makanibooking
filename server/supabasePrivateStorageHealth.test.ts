import type { Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./_core/app";
import { inspectSupabasePrivateStorage } from "./_core/supabasePrivateStorageHealth";

const serviceRoleKey = "storage-health-test-key";
const servers: Server[] = [];

function config(overrides: Record<string, unknown> = {}) {
  return {
    supabaseUrl: "https://example.supabase.co",
    serviceRoleKey,
    bucket: "b2rent-private-documents",
    ...overrides,
  } as Parameters<typeof inspectSupabasePrivateStorage>[0];
}

async function requestStorageHealth(healthConfig: ReturnType<typeof config>): Promise<Response> {
  const server = createApp({ privateStorageHealthConfig: healthConfig }).listen(0);
  servers.push(server);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server has no port");
  return fetch(`http://127.0.0.1:${address.port}/api/health/storage`);
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

describe("Supabase private storage health", () => {
  it("performs a metadata-only GET for the configured private bucket", async () => {
    const calls: Array<{ url: string; method?: string }> = [];
    const health = await inspectSupabasePrivateStorage(
      config({
        fetchImpl: async (input: string | URL | Request, init?: RequestInit) => {
          calls.push({ url: String(input), method: init?.method });
          return new Response(JSON.stringify({ id: "b2rent-private-documents" }), { status: 200 });
        },
      }),
    );

    expect(health).toEqual({ ready: true, configured: true, status: "ready" });
    expect(calls).toEqual([
      {
        url: "https://example.supabase.co/storage/v1/bucket/b2rent-private-documents",
        method: "GET",
      },
    ]);
  });

  it("returns only sanitized states for a missing bucket or an unavailable service", async () => {
    await expect(
      inspectSupabasePrivateStorage(config({ fetchImpl: async () => new Response(null, { status: 404 }) })),
    ).resolves.toEqual({ ready: false, configured: true, status: "bucket_not_found" });

    await expect(
      inspectSupabasePrivateStorage(config({ fetchImpl: async () => { throw new Error(serviceRoleKey); } })),
    ).resolves.toEqual({ ready: false, configured: true, status: "unavailable" });
  });

  it("does not call the network when configuration is incomplete", async () => {
    let called = false;
    const health = await inspectSupabasePrivateStorage(
      config({
        serviceRoleKey: "",
        fetchImpl: async () => {
          called = true;
          return new Response(null, { status: 200 });
        },
      }),
    );

    expect(health).toEqual({ ready: false, configured: false, status: "not_configured" });
    expect(called).toBe(false);
  });

  it("publishes a safe health contract without a server key", async () => {
    const response = await requestStorageHealth(
      config({ fetchImpl: async () => new Response("unexpected", { status: 500 }) }),
    );
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).toContain("unavailable");
    expect(body).not.toContain(serviceRoleKey);
  });
});
