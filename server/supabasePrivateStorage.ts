import { randomUUID } from "node:crypto";

export const DEFAULT_SUPABASE_PRIVATE_STORAGE_BUCKET = "b2rent-private-documents";

export type PrivateDocumentKind = "kyc" | "contract" | "dispute";

export type SupabasePrivateStorageConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  bucket?: string;
  fetchImpl?: typeof fetch;
};

export type SupabasePrivateStorageReadiness = {
  configured: boolean;
  bucket: string;
  missing: Array<"SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY">;
};

export class SupabasePrivateStorageError extends Error {
  constructor(public readonly code: "STORAGE_NOT_CONFIGURED" | "STORAGE_SIGN_FAILED" | "INVALID_OBJECT_KEY") {
    super(code);
    this.name = "SupabasePrivateStorageError";
  }
}

function getBucketName(bucket?: string): string {
  return bucket?.trim() || DEFAULT_SUPABASE_PRIVATE_STORAGE_BUCKET;
}

function isSafeBucketName(bucket: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,62}$/.test(bucket);
}

function getSafeExtension(originalFileName: string): string {
  const match = /\.([a-z0-9]{1,10})$/i.exec(originalFileName.trim());
  return match ? `.${match[1].toLowerCase()}` : ".bin";
}

function requireSafeScope(scope: string): string {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(scope)) {
    throw new SupabasePrivateStorageError("INVALID_OBJECT_KEY");
  }

  return scope;
}

/**
 * Generates opaque object names: source filenames are not retained in paths.
 * The application must persist the original filename as protected metadata.
 */
export function createPrivateDocumentObjectKey(input: {
  kind: PrivateDocumentKind;
  subjectId: string;
  originalFileName: string;
}): string {
  const subjectId = requireSafeScope(input.subjectId);
  const extension = getSafeExtension(input.originalFileName);
  return `b2rent/private/${input.kind}/${subjectId}/${randomUUID()}${extension}`;
}

export function isAllowedPrivateDocumentObjectKey(objectKey: string): boolean {
  return /^b2rent\/private\/(kyc|contract|dispute)\/[A-Za-z0-9_-]{1,128}\/[a-f0-9-]{36}\.[a-z0-9]{1,10}$/.test(
    objectKey,
  );
}

export function getSupabasePrivateStorageReadiness(config: Pick<SupabasePrivateStorageConfig, "supabaseUrl" | "serviceRoleKey" | "bucket">): SupabasePrivateStorageReadiness {
  const missing: SupabasePrivateStorageReadiness["missing"] = [];
  if (!config.supabaseUrl.trim()) missing.push("SUPABASE_URL");
  if (!config.serviceRoleKey.trim()) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  const bucket = getBucketName(config.bucket);
  return {
    configured: missing.length === 0 && isSafeBucketName(bucket),
    bucket,
    missing,
  };
}

function encodeObjectKeyForPath(objectKey: string): string {
  return objectKey.split("/").map(encodeURIComponent).join("/");
}

/**
 * Does not upload or delete files. This method is intentionally unused until
 * the private bucket, RLS policy, and application-level authorization are live.
 */
export class SupabasePrivateStorageAdapter {
  private readonly bucket: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: SupabasePrivateStorageConfig) {
    this.bucket = getBucketName(config.bucket);
    this.baseUrl = config.supabaseUrl.trim().replace(/\/+$/, "");
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async createSignedDownloadUrl(objectKey: string, expiresInSeconds = 300): Promise<string> {
    if (!isAllowedPrivateDocumentObjectKey(objectKey)) {
      throw new SupabasePrivateStorageError("INVALID_OBJECT_KEY");
    }

    const readiness = getSupabasePrivateStorageReadiness(this.config);
    if (!readiness.configured || !isSafeBucketName(this.bucket)) {
      throw new SupabasePrivateStorageError("STORAGE_NOT_CONFIGURED");
    }

    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 60 || expiresInSeconds > 900) {
      throw new SupabasePrivateStorageError("INVALID_OBJECT_KEY");
    }

    let baseUrl: URL;
    try {
      baseUrl = new URL(this.baseUrl);
    } catch {
      throw new SupabasePrivateStorageError("STORAGE_NOT_CONFIGURED");
    }

    if (baseUrl.protocol !== "https:") {
      throw new SupabasePrivateStorageError("STORAGE_NOT_CONFIGURED");
    }

    const response = await this.fetchImpl(
      `${this.baseUrl}/storage/v1/object/sign/${encodeURIComponent(this.bucket)}/${encodeObjectKeyForPath(objectKey)}`,
      {
        method: "POST",
        headers: {
          apikey: this.config.serviceRoleKey,
          Authorization: `Bearer ${this.config.serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: expiresInSeconds }),
      },
    );

    if (!response.ok) {
      throw new SupabasePrivateStorageError("STORAGE_SIGN_FAILED");
    }

    const payload = (await response.json().catch(() => null)) as { signedURL?: unknown } | null;
    if (!payload || typeof payload.signedURL !== "string" || !payload.signedURL) {
      throw new SupabasePrivateStorageError("STORAGE_SIGN_FAILED");
    }

    const signedUrl = new URL(payload.signedURL, `${this.baseUrl}/`);
    if (signedUrl.origin !== baseUrl.origin || signedUrl.protocol !== "https:") {
      throw new SupabasePrivateStorageError("STORAGE_SIGN_FAILED");
    }

    return signedUrl.toString();
  }
}
