import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("AIChatWidget mobile affordance", () => {
  it("uses the dedicated assistant motion treatment and clears the mobile navigation", async () => {
    const [component, styles] = await Promise.all([
      readFile(new URL("./AIChatWidget.tsx", import.meta.url), "utf8"),
      readFile(new URL("../index.css", import.meta.url), "utf8"),
    ]);

    expect(component).toContain("bottom-[calc(5.75rem+env(safe-area-inset-bottom))]");
    expect(component).toContain("b2-ai-chat-trigger__bot");
    expect(component).toContain("b2-ai-chat-trigger__halo");
    expect(styles).toContain("@media (prefers-reduced-motion: no-preference)");
    expect(styles).toContain("@keyframes b2-assistant-float");
    expect(styles).toContain("@keyframes b2-assistant-halo");
  });
});
