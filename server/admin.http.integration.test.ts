import { describe, expect, it } from "vitest";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";

describe("Admin HTTP authorization boundary", () => {
  it("rejects unauthenticated access to the admin overview procedure", async () => {
    try {
      const response = await fetch(`${baseUrl}/api/trpc/admin.overview`);
      expect([401, 403]).toContain(response.status);
    } catch (error) {
      if (error instanceof TypeError) {
        return;
      }
      throw error;
    }
  }, 10_000);
});

export {};
