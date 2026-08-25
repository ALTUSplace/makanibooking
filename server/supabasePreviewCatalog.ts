import { Pool, type PoolConfig } from "pg";

const PUBLIC_LISTING_STATUSES = ["Published", "Available"] as const;
const PUBLIC_LISTINGS_QUERY = `
  SELECT
    l.id,
    l.owner_id AS "ownerId",
    l.title,
    l.description,
    l.category,
    l.price_per_day AS "pricePerDay",
    l.image_url AS "imageUrl",
    l.status,
    l.city,
    l.fuel_type AS "fuelType",
    l.transmission,
    l.rooms,
    l.office_type AS "officeType",
    l.rental_period AS "rentalPeriod",
    l.amenities,
    l.availability,
    l.ical_imported_ranges AS "icalImportedRanges",
    l.created_at AS "createdAt",
    u.name AS "ownerName"
  FROM b2rent.listings AS l
  LEFT JOIN b2rent.users AS u ON u.id = l.owner_id
  WHERE l.status = ANY($1::text[])
  ORDER BY l.created_at DESC
  LIMIT $2
`;

type RawPublicListing = {
  id: string | number;
  ownerId: string | number;
  title: string;
  description: string | null;
  category: "car" | "real_estate";
  pricePerDay: string | number;
  imageUrl: string | null;
  status: (typeof PUBLIC_LISTING_STATUSES)[number];
  city: string;
  fuelType: string | null;
  transmission: string | null;
  rooms: string | number | null;
  officeType: string | null;
  rentalPeriod: "daily" | "monthly" | "yearly" | null;
  amenities: string | null;
  availability: unknown;
  icalImportedRanges: unknown;
  createdAt: Date | string;
  ownerName: string | null;
};

type QueryClient = {
  query: (sql: string, values: unknown[]) => Promise<{ rows: RawPublicListing[] }>;
  end: () => Promise<void>;
};

type ClientFactory = (config: PoolConfig) => QueryClient;

export type SupabasePreviewListing = {
  id: number;
  ownerId: number;
  title: string;
  description: string | null;
  category: "car" | "real_estate";
  pricePerDay: number;
  imageUrl: string | null;
  status: (typeof PUBLIC_LISTING_STATUSES)[number];
  city: string;
  fuelType: string | null;
  transmission: string | null;
  rooms: number;
  officeType: string | null;
  rentalPeriod: "daily" | "monthly" | "yearly" | null;
  amenities: string | null;
  availability: string | null;
  icalImportedRanges: string | null;
  createdAt: Date;
  ownerName: string | null;
};

export type SupabasePreviewCatalogResult = {
  configured: boolean;
  ready: boolean;
  status: "not_configured" | "ready" | "unavailable";
  listings: SupabasePreviewListing[];
};

function defaultClientFactory(config: PoolConfig): QueryClient {
  const pool = new Pool(config);
  return {
    query: (sql, values) => pool.query(sql, values),
    end: () => pool.end(),
  };
}

function logSafeReadFailure(error: unknown): void {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const errorCode =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : "unknown";

  console.warn("[Supabase preview catalog] read failed", { errorName, errorCode });
}

function toSafeInteger(value: string | number | null, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Invalid ${field} returned by Supabase preview catalog`);
  }
  return parsed;
}

function toJsonText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value : JSON.stringify(value);
}

function normalizePublicListing(row: RawPublicListing): SupabasePreviewListing {
  const createdAt = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    throw new Error("Invalid createdAt returned by Supabase preview catalog");
  }

  return {
    id: toSafeInteger(row.id, "listing id"),
    ownerId: toSafeInteger(row.ownerId, "owner id"),
    title: row.title,
    description: row.description,
    category: row.category,
    pricePerDay: toSafeInteger(row.pricePerDay, "pricePerDay"),
    imageUrl: row.imageUrl,
    status: row.status,
    city: row.city,
    fuelType: row.fuelType,
    transmission: row.transmission,
    rooms: toSafeInteger(row.rooms ?? 0, "rooms"),
    officeType: row.officeType,
    rentalPeriod: row.rentalPeriod,
    amenities: row.amenities,
    availability: toJsonText(row.availability),
    icalImportedRanges: toJsonText(row.icalImportedRanges),
    createdAt,
    ownerName: row.ownerName,
  };
}

export async function readSupabasePreviewCatalog(
  limit = 24,
  connectionString = process.env.SUPABASE_DB_URL?.trim(),
  createClient: ClientFactory = defaultClientFactory,
): Promise<SupabasePreviewCatalogResult> {
  if (!connectionString?.startsWith("postgres")) {
    return { configured: false, ready: false, status: "not_configured", listings: [] };
  }

  const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 100));
  const client = createClient({
    connectionString,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 5_000,
    max: 1,
    options: "-c default_transaction_read_only=on",
  });

  try {
    const result = await client.query(PUBLIC_LISTINGS_QUERY, [PUBLIC_LISTING_STATUSES, safeLimit]);
    return {
      configured: true,
      ready: true,
      status: "ready",
      listings: result.rows.map(normalizePublicListing),
    };
  } catch (error) {
    logSafeReadFailure(error);
    return { configured: true, ready: false, status: "unavailable", listings: [] };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export const supabasePreviewCatalogInternals = {
  PUBLIC_LISTINGS_QUERY,
  PUBLIC_LISTING_STATUSES,
  normalizePublicListing,
};
