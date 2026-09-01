import { describe, expect, it } from "vitest";
import { createImageVerificationProof, verifyImageVerificationProof } from "./imageVerification";

describe("image verification proof security", () => {
  const bytes = new TextEncoder().encode("original-listing-photo");
  const url = "https://storage.example/listing-photo.webp";

  it("accepts a proof only for the same owner, URL, and bytes", () => {
    const proof = createImageVerificationProof({ ownerId: 42, url, bytes });
    expect(verifyImageVerificationProof({ proof, ownerId: 42, url, bytes })).toBe(true);
    expect(verifyImageVerificationProof({ proof, ownerId: 43, url, bytes })).toBe(false);
    expect(verifyImageVerificationProof({ proof, ownerId: 42, url: `${url}?changed=1`, bytes })).toBe(false);
    expect(verifyImageVerificationProof({ proof, ownerId: 42, url, bytes: new TextEncoder().encode("tampered") })).toBe(false);
  });

  it("rejects malformed and forged proofs", () => {
    expect(verifyImageVerificationProof({ proof: "forged.proof", ownerId: 42, url, bytes })).toBe(false);
    const proof = createImageVerificationProof({ ownerId: 42, url, bytes });
    const [payload] = proof.split(".");
    expect(verifyImageVerificationProof({ proof: `${payload}.forged-signature`, ownerId: 42, url, bytes })).toBe(false);
  });
});
