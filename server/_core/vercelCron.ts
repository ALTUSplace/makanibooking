import { timingSafeEqual } from "node:crypto";

export type VercelCronDryRun = {
  ok: true;
  mode: "dry-run";
  job: "reconcile";
  effects: {
    databaseWrites: 0;
    messagesQueued: 0;
  };
};

/**
 * Compares only equal-length byte sequences with a constant-time primitive.
 * The caller deliberately receives only a boolean so authentication failures
 * cannot disclose whether a secret is configured or how it differed.
 */
export function verifyVercelCronAuthorization(
  authorizationHeader: string | undefined,
  cronSecret: string | undefined,
): boolean {
  if (!cronSecret || !authorizationHeader?.startsWith("Bearer ")) return false;

  const supplied = authorizationHeader.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(cronSecret, "utf8");
  const suppliedBuffer = Buffer.from(supplied, "utf8");

  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

/**
 * Safe first-stage Vercel Cron operation. Future adapters may replace this
 * dry run only after PostgreSQL, email, and idempotency guarantees are ready.
 */
export function runVercelCronReconcileDryRun(): VercelCronDryRun {
  return {
    ok: true,
    mode: "dry-run",
    job: "reconcile",
    effects: {
      databaseWrites: 0,
      messagesQueued: 0,
    },
  };
}
