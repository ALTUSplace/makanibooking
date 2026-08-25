import type { Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "./_core/app";
import { getSupabaseHealthServiceName } from "./_core/supabasePreviewHealth";
import { runVercelCronReconcileDryRun, verifyVercelCronAuthorization } from "./_core/vercelCron";

const testCronSecret = "cron-test-value";
const servers: Server[] = [];

async function requestCron(authorization?: string): Promise<Response> {
  const server = createApp({ cronSecret: testCronSecret }).listen(0);
  servers.push(server);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server has no port");

  return fetch(`http://127.0.0.1:${address.port}/api/cron/reconcile`, {
    headers: authorization ? { authorization } : undefined,
  });
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))));
});

describe("Vercel Cron authorization", () => {
  it("rejects a missing cron secret and all unauthenticated requests", async () => {
    expect(verifyVercelCronAuthorization(`Bearer ${testCronSecret}`, "")).toBe(false);

    const response = await requestCron();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "unauthorized" });
  });

  it("rejects an invalid bearer token without exposing the configured secret", async () => {
    const response = await requestCron("Bearer invalid-value");
    const body = await response.text();

    expect(response.status).toBe(401);
    expect(body).not.toContain(testCronSecret);
    expect(body).not.toContain("invalid-value");
  });

  it("accepts the configured bearer token and performs a dry run only", async () => {
    const response = await requestCron(`Bearer ${testCronSecret}`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      mode: "dry-run",
      job: "reconcile",
      effects: { databaseWrites: 0, messagesQueued: 0 },
    });
    expect(JSON.stringify(body)).not.toContain(testCronSecret);
  });

  it("keeps the reconcile implementation free of database writes and message dispatch", () => {
    expect(runVercelCronReconcileDryRun()).toMatchObject({
      effects: { databaseWrites: 0, messagesQueued: 0 },
    });
  });
});

describe("Supabase health service labels", () => {
  it("labels only the Vercel target as production", () => {
    expect(getSupabaseHealthServiceName("vercel")).toBe("b2-rent-supabase-production");
    expect(getSupabaseHealthServiceName("manus")).toBe("b2-rent-supabase-preview");
  });
});
