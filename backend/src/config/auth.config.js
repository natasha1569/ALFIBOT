import crypto from "crypto";

const DEFAULT_EMAIL = "rsarevalo@puce.edu.ec";
const DEVELOPMENT_TOKEN_SECRET = "alfi_dev_secret_change_me";

const DEFAULT_PASSWORD_HASH =
  "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";

const resolveTokenSecret = () => {
  const configuredSecret = String(process.env.AUTH_TOKEN_SECRET || "").trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_TOKEN_SECRET es obligatorio cuando NODE_ENV=production."
    );
  }

  console.warn(
    "[security] AUTH_TOKEN_SECRET no configurado; se usa un secreto temporal solo para desarrollo."
  );

  return DEVELOPMENT_TOKEN_SECRET;
};

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
  secret: resolveTokenSecret(),
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
