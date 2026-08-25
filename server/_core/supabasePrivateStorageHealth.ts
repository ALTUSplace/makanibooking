import {
  getSupabasePrivateStorageReadiness,
  type SupabasePrivateStorageConfig,
} from "../supabasePrivateStorage";

export type SupabasePrivateStorageHealth = {
  ready: boolean;
  configured: boolean;
  status: "ready" | "not_configured" | "bucket_not_found" | "unavailable";
};

/**
 * Performs a metadata-only bucket check. It never uploads, lists, downloads,
 * signs, or deletes objects, and errors are intentionally reduced to a small
 * safe status vocabulary for public health responses.
 */
export async function inspectSupabasePrivateStorage(
  config: SupabasePrivateStorageConfig,
): Promise<SupabasePrivateStorageHealth> {
  const readiness = getSupabasePrivateStorageReadiness(config);
  if (!readiness.configured) {
    return { ready: false, configured: false, status: "not_configured" };
  }

  const baseUrl = config.supabaseUrl.trim().replace(/\/+$/, "");
  let url: URL;
  try {
    url = new URL(`${baseUrl}/storage/v1/bucket/${encodeURIComponent(readiness.bucket)}`);
  } catch {
    return { ready: false, configured: false, status: "not_configured" };
  }

  if (url.protocol !== "https:") {
    return { ready: false, configured: false, status: "not_configured" };
  }

  try {
    const response = await (config.fetchImpl ?? fetch)(url, {
      method: "GET",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
    });

    if (response.ok) return { ready: true, configured: true, status: "ready" };
    if (response.status === 404) return { ready: false, configured: true, status: "bucket_not_found" };
    return { ready: false, configured: true, status: "unavailable" };
  } catch {
    return { ready: false, configured: true, status: "unavailable" };
  }
}
