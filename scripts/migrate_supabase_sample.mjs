import mysql from "mysql2/promise";
import pg from "pg";

const { Pool } = pg;
const mysqlDb = await mysql.createConnection({ uri: process.env.DATABASE_URL, connectTimeout: 15_000, ssl: { rejectUnauthorized: true } });
const pgPool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, connectionTimeoutMillis: 15_000, max: 1, ssl: { rejectUnauthorized: false } });

const userColumns = ["id","open_id","name","email","whatsapp_phone","commercial_register","agency_name","agency_logo_url","agency_phone","agency_email","agency_address","agency_website","agency_latitude","agency_longitude","agency_hours","login_method","password_hash","role","created_at","updated_at","last_signed_in","legal_consent_version","legal_consent_at"];
const listingColumns = ["listing_id","owner_id","title","description","category","price_per_day","image_url","status","city","fuel_type","transmission","rooms","office_type","rental_period","amenities","availability","ical_import_url","ical_export_token","ical_imported_ranges","ical_last_synced_at","ical_sync_status","ical_sync_error","created_at"];

function mapUser(row) {
  return [row.id,row.openId,row.name,row.email,row.whatsappPhone,row.commercialRegister,row.agencyName,row.agencyLogoUrl,row.agencyPhone,row.agencyEmail,row.agencyAddress,row.agencyWebsite,row.agencyLatitude,row.agencyLongitude,row.agencyHours,row.loginMethod,row.passwordHash,row.role,row.createdAt,row.updatedAt,row.lastSignedIn,row.legalConsentVersion,row.legalConsentAt];
}
function mapListing(row) {
  return [row.listing_id ?? row.id,row.owner_id ?? row.ownerId,row.title,row.description,row.category,row.price_per_day ?? row.pricePerDay,row.image_url ?? row.imageUrl,row.status,row.city,row.fuel_type ?? row.fuelType,row.transmission,row.rooms,row.office_type ?? row.officeType,row.rental_period ?? row.rentalPeriod,row.amenities,row.availability,row.ical_import_url ?? row.icalImportUrl,row.ical_export_token ?? row.icalExportToken,row.ical_imported_ranges ?? row.icalImportedRanges,row.ical_last_synced_at ?? row.icalLastSyncedAt,row.ical_sync_status ?? row.icalSyncStatus,row.ical_sync_error ?? row.icalSyncError,row.created_at ?? row.createdAt];
}

try {
  const [users] = await mysqlDb.query("SELECT id, openId, name, email, whatsapp_phone AS whatsappPhone, commercial_register AS commercialRegister, agency_name AS agencyName, agency_logo_url AS agencyLogoUrl, agency_phone AS agencyPhone, agency_email AS agencyEmail, agency_address AS agencyAddress, agency_website AS agencyWebsite, agency_latitude AS agencyLatitude, agency_longitude AS agencyLongitude, agency_hours AS agencyHours, loginMethod, passwordHash, role, createdAt, updatedAt, lastSignedIn, legal_consent_version AS legalConsentVersion, legal_consent_at AS legalConsentAt FROM users ORDER BY id LIMIT 5");
  const [listings] = await mysqlDb.query("SELECT listing_id, owner_id, title, description, category, price_per_day, image_url, status, city, fuel_type, transmission, rooms, office_type, rental_period, amenities, availability, ical_import_url, ical_export_token, ical_imported_ranges, ical_last_synced_at, ical_sync_status, ical_sync_error, createdAt AS created_at FROM listings ORDER BY listing_id LIMIT 5");
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");
    const userPlaceholders = userColumns.map((_, i) => `$${i + 1}`).join(",");
    for (const row of users) await client.query(`INSERT INTO public.users (${userColumns.join(",")}) VALUES (${userPlaceholders}) ON CONFLICT DO NOTHING`, mapUser(row));
    const listingPlaceholders = listingColumns.map((_, i) => `$${i + 1}`).join(",");
    for (const row of listings) await client.query(`INSERT INTO public.listings (${listingColumns.join(",")}) VALUES (${listingPlaceholders}) ON CONFLICT DO NOTHING`, mapListing(row));
    await client.query("COMMIT");
    const counts = await client.query("SELECT (SELECT count(*) FROM public.users) AS users, (SELECT count(*) FROM public.listings) AS listings");
    console.log(JSON.stringify({ status: "sample-migration-complete", selected: { users: users.length, listings: listings.length }, targetCounts: counts.rows[0], sourceUnchanged: true }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
} catch (error) {
  console.error(JSON.stringify({ status: "sample-migration-failed", message: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exitCode = 1;
} finally {
  await mysqlDb.end().catch(() => {});
  await pgPool.end().catch(() => {});
}
