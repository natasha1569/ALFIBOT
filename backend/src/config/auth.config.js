import crypto from "crypto";

const DEFAULT_EMAIL = "rsarevalo@puce.edu.ec";

const DEFAULT_PASSWORD_HASH =
  "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";

export const authUser = {
  id: 1,
  name: "Romel Santiago Arévalo Vásquez",
  email: (process.env.AUTH_EMAIL || DEFAULT_EMAIL).trim().toLowerCase(),
  role: "user",
  passwordHash: (process.env.AUTH_PASSWORD_HASH || DEFAULT_PASSWORD_HASH)
    .trim()
    .toLowerCase(),
};

export const authTokenConfig = {
  secret: process.env.AUTH_TOKEN_SECRET || "alfi_dev_secret_change_me",
  expiresInSeconds: Number(process.env.AUTH_TOKEN_EXPIRES_SECONDS || 7200),
};

export function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(String(password), "utf8")
    .digest("hex");
}

export function hashesMatch(receivedHash, storedHash) {
  const receivedBuffer = Buffer.from(receivedHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  return (
    receivedBuffer.length === storedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, storedBuffer)
  );
}
