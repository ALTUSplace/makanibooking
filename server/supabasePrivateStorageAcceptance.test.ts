import { describe, expect, it, vi } from "vitest";
import { runSupabasePrivateStorageAcceptanceProbe } from "./supabasePrivateStorageAcceptance";

const secret = "storage-acceptance-secret";
const baseConfig = {
  supabaseUrl: "https://project.supabase.co",
  serviceRoleKey: secret,
  bucket: "b2rent-private-documents",
};

describe("Supabase private storage acceptance probe", () => {
  it("writes only an opaque probe, confirms private access and signed download, then removes it", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ signedURL: "/object/sign/b2rent-private-documents/probe?token=opaque" }), { status: 200 }))
      .mockResolvedValueOnce(new Response("b2rent-storage-acceptance-probe-v1", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 200 }));

    const result = await runSupabasePrivateStorageAcceptanceProbe({ ...baseConfig, fetchImpl });

    expect(result).toEqual({
      ok: true,
      mode: "acceptance-probe",
      effects: { uploaded: 1, signedDownloadVerified: true, publicAccessBlocked: true, removed: 1 },
    });
    expect(fetchImpl.mock.calls.map(([input, init]) => [String(input), init?.method ?? "GET"])).toEqual([
      [expect.stringContaining("/storage/v1/object/b2rent-private-documents/b2rent/private/contract/acceptance-probe/"), "POST"],
      [expect.stringContaining("/storage/v1/object/public/b2rent-private-documents/b2rent/private/contract/acceptance-probe/"), "GET"],
      [expect.stringContaining("/storage/v1/object/sign/b2rent-private-documents/b2rent/private/contract/acceptance-probe/"), "POST"],
      [expect.stringContaining("/storage/v1/object/sign/b2rent-private-documents/probe?token=opaque"), "GET"],
      ["https://project.supabase.co/storage/v1/object/b2rent-private-documents", "DELETE"],
    ]);
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("removes the probe even when signing fails and does not expose the service key", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response("", { status: 500 }))
      .mockResolvedValueOnce(new Response("", { status: 200 }));

    const failure = await runSupabasePrivateStorageAcceptanceProbe({ ...baseConfig, fetchImpl }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error).message).toBe("storage_acceptance_sign_failed");
    expect((failure as Error).message).not.toContain(secret);
    expect(fetchImpl.mock.calls.at(-1)?.[1]?.method).toBe("DELETE");
    expect(fetchImpl.mock.calls.map(([input]) => String(input)).join("\n")).not.toContain(secret);
  });

  it("reports a generic cleanup failure after a successful probe", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ signedURL: "/object/sign/b2rent-private-documents/probe?token=opaque" }), { status: 200 }))
      .mockResolvedValueOnce(new Response("b2rent-storage-acceptance-probe-v1", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 500 }));

    await expect(runSupabasePrivateStorageAcceptanceProbe({ ...baseConfig, fetchImpl })).rejects.toThrow("storage_acceptance_cleanup_failed");
    expect(fetchImpl.mock.calls.at(-1)?.[1]?.method).toBe("DELETE");
  });

  it("does not follow a signed URL outside the configured Supabase origin", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ signedURL: "https://untrusted.example/probe" }), { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 200 }));

    await expect(runSupabasePrivateStorageAcceptanceProbe({ ...baseConfig, fetchImpl })).rejects.toThrow("storage_acceptance_sign_payload_invalid");
    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(fetchImpl.mock.calls.some(([input]) => String(input).startsWith("https://untrusted.example/"))).toBe(false);
  });
});
