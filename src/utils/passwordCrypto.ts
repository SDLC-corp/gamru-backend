import crypto from "crypto";

/**
 * Reverses the frontend's login-password obfuscation.
 *
 * The client AES-256-GCM encrypts the password and sends
 * `enc:v1:<base64(iv(12) + ciphertext+tag)>`. We decrypt it back to the
 * plaintext so the existing bcrypt comparison keeps working unchanged.
 *
 * If the value is NOT in the encrypted format (e.g. a direct Swagger/Postman
 * call), it is returned as-is so those flows keep working.
 */

const SECRET: string =
  process.env.PASSWORD_SECRET || "gamru-engage-shared-password-secret";

const ENC_PREFIX = "enc:v1:";

const getKey = (): Buffer =>
  crypto.createHash("sha256").update(SECRET).digest(); // 32-byte key

export const decryptPassword = (value: string): string => {
  if (!value || !value.startsWith(ENC_PREFIX)) {
    return value; // plaintext / not encrypted — leave untouched
  }

  try {
    const packed = Buffer.from(value.slice(ENC_PREFIX.length), "base64");
    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(packed.length - 16);
    const ciphertext = packed.subarray(12, packed.length - 16);

    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);

    const plain = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return plain.toString("utf8");
  } catch {
    // Tampered or wrong secret — return original so auth simply fails.
    return value;
  }
};
