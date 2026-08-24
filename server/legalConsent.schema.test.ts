import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { users } from "../drizzle/schema";

describe("مخطط الموافقة القانونية للمستخدم", () => {
  it("يحافظ على عمود legal_consent_at المطابق لقاعدة البيانات", () => {
    const columns = getTableColumns(users);

    expect(columns.legalConsentAt).toBeDefined();
    expect(columns.legalConsentAt.name).toBe("legal_consent_at");
  });
});
