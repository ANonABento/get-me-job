import { describe, expect, it } from "vitest";
import { createSlothingBentoEncryptionAdapter } from "./encryption";

describe("Slothing BentoRouter encryption", () => {
  it("round-trips provider keys without storing plaintext", async () => {
    const adapter = createSlothingBentoEncryptionAdapter("secret-one");

    const stored = await adapter.encrypt("sk-test-provider-key");

    expect(stored).toMatch(/^aes-256-gcm-v1:/);
    expect(stored).not.toContain("sk-test-provider-key");
    await expect(adapter.decrypt(stored)).resolves.toBe("sk-test-provider-key");
  });

  it("fails closed when NEXTAUTH_SECRET changes", async () => {
    const first = createSlothingBentoEncryptionAdapter("secret-one");
    const second = createSlothingBentoEncryptionAdapter("secret-two");
    const stored = await first.encrypt("sk-test-provider-key");

    await expect(second.decrypt(stored)).rejects.toThrow(
      "Unable to decrypt BentoRouter provider key.",
    );
  });
});
