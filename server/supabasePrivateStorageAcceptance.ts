import {
  createPrivateDocumentObjectKey,
  isAllowedPrivateDocumentObjectKey,
  type PrivateDocumentKind,
} from "./supabasePrivateStorage";

const probeBody = "b2rent-storage-acceptance-probe-v1";
const probeKind: PrivateDocumentKind = "contract";
const probeSubjectId = "acceptance-probe";
const signedUrlLifetimeSeconds = 60;

export type SupabasePrivateStorageAcceptanceConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket: string;
  fetchImpl?: typeof fetch;
};

export type SupabasePrivateStorageAcceptanceResult = {
  ok: true;
  mode: "acceptance-probe";
  effects: {
    uploaded: 1;
    signedDownloadVerified: true;
    publicAccessBlocked: true;
    removed: 1;
  };
};

function storageHeaders(serviceRoleKey: string, contentType?: string): HeadersInit {
  return {
    authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    ...(contentType ? { "content-type": contentType } : {}),
  };
}

function getSecureStorageBaseUrl(config: SupabasePrivateStorageAcceptanceConfig): URL {
  if (!config.serviceRoleKey.trim() || !/^[a-z0-9][a-z0-9-]{2,62}$/.test(config.bucket.trim())) {
    throw new Error("storage_acceptance_not_configured");
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(config.supabaseUrl.trim());
  } catch {
    throw new Error("storage_acceptance_not_configured");
  }

  if (
    baseUrl.protocol !== "https:" ||
    baseUrl.username ||
    baseUrl.password ||
    baseUrl.pathname !== "/" ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    throw new Error("storage_acceptance_not_configured");
  }

  return new URL(baseUrl.origin);
}

function encodeObjectKeyForPath(objectKey: string): string {
  return objectKey.split("/").map(encodeURIComponent).join("/");
}

function resolveSignedDownloadUrl(baseUrl: URL, signedUrl: string): string {
  const signedPath = signedUrl.startsWith("/") && !signedUrl.startsWith("/storage/v1/") ? `/storage/v1${signedUrl}` : signedUrl;
  let resolved: URL;
  try {
    resolved = new URL(signedPath, `${baseUrl.origin}/`);
  } catch {
    throw new Error("storage_acceptance_sign_payload_invalid");
  }

  if (resolved.protocol !== "https:" || resolved.origin !== baseUrl.origin || !resolved.pathname.startsWith("/storage/v1/object/sign/")) {
    throw new Error("storage_acceptance_sign_payload_invalid");
  }

  return resolved.toString();
}

/**
 * Executes only from the CRON_SECRET-protected Vercel Cron route and only while
 * B2RENT_STORAGE_ACCEPTANCE_TEST_ENABLED is explicitly true. The probe writes
 * a random, non-personal text file, verifies its signed link and then deletes it
 * in a finally block. It never returns object keys, URLs, headers, or secrets.
 */
export async function runSupabasePrivateStorageAcceptanceProbe(
  config: SupabasePrivateStorageAcceptanceConfig,
): Promise<SupabasePrivateStorageAcceptanceResult> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const baseUrl = getSecureStorageBaseUrl(config);
  const bucket = config.bucket.trim();
  const objectKey = createPrivateDocumentObjectKey({
    kind: probeKind,
    subjectId: probeSubjectId,
    originalFileName: "acceptance-probe.txt",
  });
  if (!isAllowedPrivateDocumentObjectKey(objectKey)) {
    throw new Error("storage_acceptance_object_key_invalid");
  }

  const storageObjectPath = `${encodeURIComponent(bucket)}/${encodeObjectKeyForPath(objectKey)}`;
  let uploaded = false;
  let primaryFailure: unknown;

  try {
    const upload = await fetchImpl(`${baseUrl.origin}/storage/v1/object/${storageObjectPath}`, {
      method: "POST",
      headers: storageHeaders(config.serviceRoleKey, "text/plain; charset=utf-8"),
      body: probeBody,
    });
    if (!upload.ok) throw new Error("storage_acceptance_upload_failed");
    uploaded = true;

    const publicRead = await fetchImpl(`${baseUrl.origin}/storage/v1/object/public/${storageObjectPath}`);
    const publicReadBody = await publicRead.text().catch(() => "");
    const publicAccessBlocked = [401, 403, 404].includes(publicRead.status)
      || (publicRead.status === 400 && /NoSuchBucket|not found|private/i.test(publicReadBody));
    if (!publicAccessBlocked) throw new Error("storage_acceptance_public_access_failed");

    const signed = await fetchImpl(`${baseUrl.origin}/storage/v1/object/sign/${storageObjectPath}`, {
      method: "POST",
      headers: storageHeaders(config.serviceRoleKey, "application/json"),
      body: JSON.stringify({ expiresIn: signedUrlLifetimeSeconds }),
    });
    if (!signed.ok) throw new Error("storage_acceptance_sign_failed");

    const signedPayload = (await signed.json().catch(() => null)) as { signedURL?: unknown; signedUrl?: unknown } | null;
    const signedUrl = signedPayload ? (signedPayload.signedURL ?? signedPayload.signedUrl) : null;
    if (typeof signedUrl !== "string" || !signedUrl) throw new Error("storage_acceptance_sign_payload_invalid");

    const signedRead = await fetchImpl(resolveSignedDownloadUrl(baseUrl, signedUrl));
    if (!signedRead.ok || (await signedRead.text()) !== probeBody) {
      throw new Error("storage_acceptance_signed_read_failed");
    }

    return {
      ok: true,
      mode: "acceptance-probe",
      effects: { uploaded: 1, signedDownloadVerified: true, publicAccessBlocked: true, removed: 1 },
    };
  } catch (error) {
    primaryFailure = error;
    throw error;
  } finally {
    if (uploaded) {
      try {
        const remove = await fetchImpl(`${baseUrl.origin}/storage/v1/object/${encodeURIComponent(bucket)}`, {
          method: "DELETE",
          headers: storageHeaders(config.serviceRoleKey, "application/json"),
          body: JSON.stringify({ prefixes: [objectKey] }),
        });
        if (!remove.ok) throw new Error("storage_acceptance_cleanup_failed");
      } catch {
        if (!primaryFailure) throw new Error("storage_acceptance_cleanup_failed");
      }
    }
  }
}
