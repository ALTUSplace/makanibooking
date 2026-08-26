import { once } from "node:events";
import { createApp } from "./_core/app";
import { afterEach, describe, expect, it } from "vitest";

const logoPath = process.env.VITE_APP_LOGO;
const servers: ReturnType<ReturnType<typeof createApp>["listen"]>[] = [];

afterEach(() => {
  for (const server of servers.splice(0)) server.close();
});

(logoPath ? describe : describe.skip)("MAKANIbooking app identity", () => {
  it("serves the configured transparent logo path through the storage endpoint", async () => {
    expect(logoPath).toBe("/manus-storage/makanibooking-logo-transparent-cropped_f0fe0bf3.png");

    const server = createApp().listen(0);
    servers.push(server);
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not expose a port");

    const response = await fetch(`http://127.0.0.1:${address.port}${logoPath}`, {
      redirect: "manual",
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBeTruthy();
  }, 20_000);
});
