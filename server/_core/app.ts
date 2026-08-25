import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { leaseEndReminderHandler } from "../leaseReminder";
import { icalExportHandler, icalSyncHandler } from "../ical";
import { getRuntimeReadiness } from "./runtimeReadiness";
import { ENV } from "./env";
import { getSupabaseHealthServiceName, inspectSupabasePreview } from "./supabasePreviewHealth";
import { runVercelCronReconcileDryRun, verifyVercelCronAuthorization } from "./vercelCron";

export type CreateAppOptions = {
  cronSecret?: string;
  runtimeTarget?: string;
};

/**
 * Creates the API application without binding a network port.
 *
 * The local runtime mounts Vite/static content and starts this app on a port;
 * Vercel imports the same app as a Node Serverless Function. Keeping route
 * registration here prevents the two environments from drifting apart.
 */
export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  const cronSecret = options.cronSecret ?? ENV.cronSecret;
  const runtimeTarget = options.runtimeTarget ?? ENV.runtimeTarget;

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/api/health", (_req, res) => {
    const readiness = getRuntimeReadiness();
    res.status(readiness.ready ? 200 : 503).json({
      ok: readiness.ready,
      service: "b2-rent-api",
      missing: readiness.missing,
    });
  });

  app.get("/api/health/supabase", async (_req, res) => {
    const health = await inspectSupabasePreview();
    res.status(health.ready ? 200 : 503).json({
      ok: health.ready,
      service: getSupabaseHealthServiceName(runtimeTarget),
      configured: health.configured,
      status: health.status,
    });
  });

  app.get("/api/cron/reconcile", (req, res) => {
    const authorizationHeader = req.get("authorization");
    if (!verifyVercelCronAuthorization(authorizationHeader, cronSecret)) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    res.status(200).json(runVercelCronReconcileDryRun());
  });

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.post("/api/scheduled/lease-end-reminder", leaseEndReminderHandler);
  app.post("/api/scheduled/ical-sync", icalSyncHandler);
  app.get("/api/ical/export/:token", icalExportHandler);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  return app;
}
