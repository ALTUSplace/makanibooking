import mysql from "mysql2/promise";
import pg from "pg";

const { Pool } = pg;
const apply = process.env.MIGRATION_APPLY === "true";
const sourceUrl = process.env.DATABASE_URL;
const targetUrl = process.env.SUPABASE_DB_URL;

if (!sourceUrl || !targetUrl) {
  throw new Error("DATABASE_URL and SUPABASE_DB_URL are required");
}

const mysqlDb = await mysql.createConnection({
  uri: sourceUrl,
  connectTimeout: 15_000,
  ssl: { rejectUnauthorized: true },
});
const pgPool = new Pool({
  connectionString: targetUrl,
  connectionTimeoutMillis: 15_000,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

const tables = [
  {
    name: "users",
    sourceSql: `SELECT id, openId, name, email, whatsapp_phone AS whatsappPhone,
      commercial_register AS commercialRegister, agency_name AS agencyName,
      agency_logo_url AS agencyLogoUrl, agency_phone AS agencyPhone,
      agency_email AS agencyEmail, agency_address AS agencyAddress,
      agency_website AS agencyWebsite, agency_latitude AS agencyLatitude,
      agency_longitude AS agencyLongitude, agency_hours AS agencyHours,
      loginMethod, passwordHash, role, createdAt, updatedAt, lastSignedIn,
      legal_consent_version AS legalConsentVersion,
      legal_consent_at AS legalConsentAt FROM users ORDER BY id`,
    targetColumns: ["id", "open_id", "name", "email", "whatsapp_phone", "commercial_register", "agency_name", "agency_logo_url", "agency_phone", "agency_email", "agency_address", "agency_website", "agency_latitude", "agency_longitude", "agency_hours", "login_method", "password_hash", "role", "created_at", "updated_at", "last_signed_in", "legal_consent_version", "legal_consent_at"],
    map: (r) => [r.id, r.openId, r.name, r.email, r.whatsappPhone, r.commercialRegister, r.agencyName, r.agencyLogoUrl, r.agencyPhone, r.agencyEmail, r.agencyAddress, r.agencyWebsite, r.agencyLatitude, r.agencyLongitude, r.agencyHours, r.loginMethod, r.passwordHash, r.role, r.createdAt, r.updatedAt, r.lastSignedIn, r.legalConsentVersion, r.legalConsentAt],
  },
  {
    name: "listings",
    sourceSql: `SELECT listing_id, owner_id, title, description, category,
      price_per_day, image_url, status, city, fuel_type, transmission, rooms,
      office_type, rental_period, amenities, availability, ical_import_url,
      ical_export_token, ical_imported_ranges, ical_last_synced_at,
      ical_sync_status, ical_sync_error, createdAt FROM listings ORDER BY listing_id`,
    targetColumns: ["listing_id", "owner_id", "title", "description", "category", "price_per_day", "image_url", "status", "city", "fuel_type", "transmission", "rooms", "office_type", "rental_period", "amenities", "availability", "ical_import_url", "ical_export_token", "ical_imported_ranges", "ical_last_synced_at", "ical_sync_status", "ical_sync_error", "created_at"],
    map: (r) => [r.listing_id, r.owner_id, r.title, r.description, r.category, r.price_per_day, r.image_url, r.status, r.city, r.fuel_type, r.transmission, r.rooms, r.office_type, r.rental_period, r.amenities, r.availability, r.ical_import_url, r.ical_export_token, r.ical_imported_ranges, r.ical_last_synced_at, r.ical_sync_status, r.ical_sync_error, r.createdAt],
  },
  {
    name: "bookings",
    sourceSql: `SELECT b.booking_id, b.renter_id, b.listing_id, b.secondary_listing_id,
      b.start_date, b.end_date, b.total_price, b.commission_fee, b.net_profit, b.status,
      b.cancellation_policy_version, b.cancellation_policy_snapshot,
      b.cancellation_policy_fingerprint, b.cancellation_policy_accepted_at,
      b.cancellation_policy_accepted_by, b.createdAt,
      u.name AS customer_name, u.whatsapp_phone AS customer_phone,
      COALESCE(l.city, 'غير محدد') AS pickup_city
      FROM bookings b
      LEFT JOIN users u ON u.id = b.renter_id
      LEFT JOIN listings l ON l.listing_id = b.listing_id
      ORDER BY b.booking_id`,
    targetColumns: ["id", "car_id", "customer_name", "customer_phone", "pickup_city", "pickup_date", "return_date", "booking_id", "renter_id", "listing_id", "secondary_listing_id", "start_date", "end_date", "total_price", "commission_fee", "net_profit", "status", "cancellation_policy_version", "cancellation_policy_snapshot", "cancellation_policy_fingerprint", "cancellation_policy_accepted_at", "cancellation_policy_accepted_by", "created_at"],
    map: (r) => [r.booking_id + 1000000000, r.listing_id, r.customer_name ?? `Renter #${r.renter_id}`, r.customer_phone ?? null, r.pickup_city, r.start_date, r.end_date, r.booking_id, r.renter_id, r.listing_id, r.secondary_listing_id, r.start_date, r.end_date, r.total_price, r.commission_fee, r.net_profit, r.status, r.cancellation_policy_version, r.cancellation_policy_snapshot, r.cancellation_policy_fingerprint, r.cancellation_policy_accepted_at, r.cancellation_policy_accepted_by, r.createdAt],
  },
  {
    name: "audit_logs",
    sourceSql: `SELECT audit_log_id, actor_id, action, entity_type, entity_id,
      before_data, after_data, created_at FROM audit_logs ORDER BY audit_log_id`,
    targetColumns: ["audit_log_id", "actor_id", "action", "entity_type", "entity_id", "before_data", "after_data", "created_at"],
    map: (r) => [r.audit_log_id, r.actor_id, r.action, r.entity_type, r.entity_id, r.before_data, r.after_data, r.created_at],
  },
];

const placeholders = (n) => Array.from({ length: n }, (_, i) => `$${i + 1}`).join(",");
const primaryKeys = { users: "id", listings: "listing_id", bookings: "booking_id", audit_logs: "audit_log_id" };

try {
  const report = { mode: apply ? "apply" : "dry-run", tables: [] };
  const client = await pgPool.connect();
  try {
    if (apply) await client.query("BEGIN");
    for (const table of tables) {
      const [rows] = await mysqlDb.query(table.sourceSql);
      const key = primaryKeys[table.name];
      const targetColumns = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`, [table.name]);
      const available = new Set(targetColumns.rows.map((r) => r.column_name));
      const missing = table.targetColumns.filter((column) => !available.has(column));
      if (missing.length > 0) {
        report.tables.push({ table: table.name, sourceRows: rows.length, applied: false, status: "skipped-target-schema-mismatch", missingColumns: missing });
        continue;
      }
      if (apply) {
        const sql = `INSERT INTO public.${table.name} (${table.targetColumns.join(",")}) VALUES (${placeholders(table.targetColumns.length)}) ON CONFLICT (${key}) DO UPDATE SET ${table.targetColumns.filter((c) => c !== key).map((c) => `${c}=EXCLUDED.${c}`).join(",")}`;
        for (const row of rows) await client.query(sql, table.map(row));
      }
      report.tables.push({ table: table.name, sourceRows: rows.length, applied: apply, status: "ready" });
    }
    if (apply) await client.query("COMMIT");
  } catch (error) {
    if (apply) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  console.log(JSON.stringify({ status: "full-migration-complete", sourceUnchanged: true, ...report }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ status: "full-migration-failed", message: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
} finally {
  await mysqlDb.end().catch(() => {});
  await pgPool.end().catch(() => {});
}
