import { describe, expect, it, vi } from "vitest";
import {
  createPrivateDocumentObjectKey,
  getSupabasePrivateStorageReadiness,
  isAllowedPrivateDocumentObjectKey,
  SupabasePrivateStorageAdapter,
  SupabasePrivateStorageError,
} from "./supabasePrivateStorage";

const validObjectKey = "b2rent/private/kyc/user_123/03a3c70a-a86d-45c3-9f0a-9beae3b9a3c7.pdf";

describe("Supabase private storage adapter", () => {
  it("generates opaque names while keeping files in a private document namespace", () => {
    const objectKey = createPrivateDocumentObjectKey({
      kind: "contract",
      subjectId: "booking_123",
      originalFileName: "contrat-kamal-2026.PDF",
    });

    expect(objectKey).toMatch(/^b2rent\/private\/contract\/booking_123\/[a-f0-9-]{36}\.pdf$/);
    expect(objectKey).not.toContain("contrat-kamal-2026");
    expect(isAllowedPrivateDocumentObjectKey(objectKey)).toBe(true);
  });

  it("rejects unsafe subject identifiers and object paths before network access", async () => {
    expect(() =>
      createPrivateDocumentObjectKey({ kind: "kyc", subjectId: "../admin", originalFileName: "cni.pdf" }),
    ).toThrow(SupabasePrivateStorageError);

    const fetchImpl = vi.fn();
    const adapter = new SupabasePrivateStorageAdapter({
      supabaseUrl: "https://project.supabase.co",
      serviceRoleKey: "test-key",
      fetchImpl,
    });

    await expect(adapter.createSignedDownloadUrl("b2rent/private/kyc/../admin/cni.pdf")).rejects.toMatchObject({
      code: "INVALID_OBJECT_KEY",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reports only missing configuration names and never a configured key", () => {
    const readiness = getSupabasePrivateStorageReadiness({
      supabaseUrl: "https://project.supabase.co",
      serviceRoleKey: "",
    });

    expect(readiness).toEqual({
      configured: false,
      bucket: "b2rent-private-documents",
      missing: ["SUPABASE_SERVICE_ROLE_KEY"],
    });
    expect(JSON.stringify(readiness)).not.toContain("test-key");
  });

  it("requests a short-lived signed URL without uploading, downloading, or exposing the server credential", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          signedURL: "/storage/v1/object/sign/b2rent-private-documents/b2rent/private/kyc/user_123/file.pdf?token=opaque",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const adapter = new SupabasePrivateStorageAdapter({
      supabaseUrl: "https://project.supabase.co",
      serviceRoleKey: "test-key",
      fetchImpl,
    });

    const signedUrl = await adapter.createSignedDownloadUrl(validObjectKey, 300);

    expect(signedUrl).toBe(
      "https://project.supabase.co/storage/v1/object/sign/b2rent-private-documents/b2rent/private/kyc/user_123/file.pdf?token=opaque",
    );
    expect(signedUrl).not.toContain("test-key");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ expiresIn: 300 }),
    });
  });

  it("rejects signing durations outside the allowed 60–900 second window", async () => {
    const adapter = new SupabasePrivateStorageAdapter({
      supabaseUrl: "https://project.supabase.co",
      serviceRoleKey: "test-key",
      fetchImpl: vi.fn(),
    });

    await expect(adapter.createSignedDownloadUrl(validObjectKey, 59)).rejects.toMatchObject({ code: "INVALID_OBJECT_KEY" });
    await expect(adapter.createSignedDownloadUrl(validObjectKey, 901)).rejects.toMatchObject({ code: "INVALID_OBJECT_KEY" });
  });
});
