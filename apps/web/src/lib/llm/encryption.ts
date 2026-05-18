import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { EncryptionAdapter } from "@anonabento/bento-router";

export const SLOTHING_BENTO_ENCRYPTION_SCHEME = "aes-256-gcm-v1";

const HKDF_SALT = "slothing:bento-router:provider-config";
const HKDF_INFO = "slothing-bento-router-api-key-encryption-v1";

export function createSlothingBentoEncryptionAdapter(
  secret = process.env.NEXTAUTH_SECRET,
): EncryptionAdapter {
  if (!secret?.trim()) {
    throw new Error(
      "NEXTAUTH_SECRET is required to encrypt BentoRouter provider keys.",
    );
  }

  const key = Buffer.from(
    hkdfSync(
      "sha256",
      Buffer.from(secret),
      Buffer.from(HKDF_SALT),
      Buffer.from(HKDF_INFO),
      32,
    ),
  );

  return {
    scheme: SLOTHING_BENTO_ENCRYPTION_SCHEME,
    async encrypt(plaintext: string): Promise<string> {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      const ciphertext = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
      ]);
      const authTag = cipher.getAuthTag();
      return [
        SLOTHING_BENTO_ENCRYPTION_SCHEME,
        iv.toString("base64url"),
        authTag.toString("base64url"),
        ciphertext.toString("base64url"),
      ].join(":");
    },
    async decrypt(stored: string): Promise<string> {
      const [scheme, iv, authTag, ciphertext] = stored.split(":");
      if (
        !constantEqual(scheme, SLOTHING_BENTO_ENCRYPTION_SCHEME) ||
        !iv ||
        !authTag ||
        !ciphertext
      ) {
        throw new Error("Unsupported BentoRouter provider key encryption.");
      }

      try {
        const decipher = createDecipheriv(
          "aes-256-gcm",
          key,
          Buffer.from(iv, "base64url"),
        );
        decipher.setAuthTag(Buffer.from(authTag, "base64url"));
        return Buffer.concat([
          decipher.update(Buffer.from(ciphertext, "base64url")),
          decipher.final(),
        ]).toString("utf8");
      } catch {
        throw new Error("Unable to decrypt BentoRouter provider key.");
      }
    },
  };
}

function constantEqual(a: string | undefined, b: string): boolean {
  if (!a) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
