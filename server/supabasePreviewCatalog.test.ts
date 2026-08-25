import { afterEach, describe, expect, it, vi } from "vitest";
import { readSupabasePreviewCatalog, supabasePreviewCatalogInternals } from "./supabasePreviewCatalog";

const originalConnectionString = process.env.SUPABASE_DB_URL;

afterEach(() => {
  if (originalConnectionString === undefined) {
    delete process.env.SUPABASE_DB_URL;
  } else {
    process.env.SUPABASE_DB_URL = originalConnectionString;
  }
  vi.restoreAllMocks();
});

describe("Supabase Preview catalog", () => {
  it("does not create a database client without a PostgreSQL connection string", async () => {
    const createClient = vi.fn();

    const result = await readSupabasePreviewCatalog(24, "", createClient);

    expect(result).toEqual({ configured: false, ready: false, status: "not_configured", listings: [] });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("uses one parameterized SELECT through a read-only connection and normalizes safe public fields", async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: "7",
          ownerId: "2",
          title: "سيارة اختبار",
          description: null,
          category: "car",
          pricePerDay: "350",
          imageUrl: null,
          status: "Published",
          city: "الدار البيضاء",
          fuelType: null,
          transmission: null,
          rooms: null,
          officeType: null,
          rentalPeriod: "daily",
          amenities: null,
          availability: [{ start: "2026-08-01", end: "2026-08-02" }],
          icalImportedRanges: null,
          createdAt: "2026-08-25T12:00:00.000Z",
          ownerName: "وكالة الاختبار",
        },
      ],
    });
    const end = vi.fn().mockResolvedValue(undefined);
    const createClient = vi.fn().mockReturnValue({ query, end });

    const result = await readSupabasePreviewCatalog(500, "postgresql://preview-user@example.test:6543/postgres", createClient);

    expect(createClient).toHaveBeenCalledWith(expect.objectContaining({
      max: 1,
      connectionTimeoutMillis: 5_000,
      statement_timeout: 5_000,
      options: "-c default_transaction_read_only=on",
    }));
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/^\s*SELECT\b/i),
      [["Published", "Available"], 100],
    );
    const executedQuery = query.mock.calls[0]?.[0] ?? "";
    expect(executedQuery).not.toMatch(/\b(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRUNCATE)\b/i);
    expect(result).toMatchObject({ configured: true, ready: true, status: "ready" });
    expect(result.listings[0]).toMatchObject({
      id: 7,
      ownerId: 2,
      pricePerDay: 350,
      rooms: 0,
      availability: '[{"start":"2026-08-01","end":"2026-08-02"}]',
      ownerName: "وكالة الاختبار",
    });
    expect(end).toHaveBeenCalledOnce();
  });

  it("returns a controlled failure without logging a connection string or database message", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const end = vi.fn().mockResolvedValue(undefined);
    const databaseError = Object.assign(new Error("password is secret and host is private"), { code: "28P01" });
    const createClient = vi.fn().mockReturnValue({ query: vi.fn().mockRejectedValue(databaseError), end });

    const result = await readSupabasePreviewCatalog(24, "postgresql://preview-user@example.test:6543/postgres", createClient);

    expect(result).toEqual({ configured: true, ready: false, status: "unavailable", listings: [] });
    expect(warning).toHaveBeenCalledWith("[Supabase preview catalog] read failed", {
      errorName: "Error",
      errorCode: "28P01",
    });
    expect(JSON.stringify(warning.mock.calls)).not.toContain("postgresql://");
    expect(JSON.stringify(warning.mock.calls)).not.toContain("password is secret");
    expect(end).toHaveBeenCalledOnce();
  });

  it("keeps its public query as a SELECT and rejects unsafe numeric identifiers during normalization", () => {
    expect(supabasePreviewCatalogInternals.PUBLIC_LISTINGS_QUERY).toMatch(/^\s*SELECT\b/i);
    expect(supabasePreviewCatalogInternals.PUBLIC_LISTINGS_QUERY).not.toMatch(/\b(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRUNCATE)\b/i);
    expect(() => supabasePreviewCatalogInternals.normalizePublicListing({
      id: "9007199254740992",
      ownerId: 1,
      title: "Invalid",
      description: null,
      category: "car",
      pricePerDay: 1,
      imageUrl: null,
      status: "Published",
      city: "Rabat",
      fuelType: null,
      transmission: null,
      rooms: 0,
      officeType: null,
      rentalPeriod: null,
      amenities: null,
      availability: null,
      icalImportedRanges: null,
      createdAt: new Date(),
      ownerName: null,
    })).toThrow("Invalid listing id");
  });
});
