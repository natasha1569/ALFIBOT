import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export function hashSecurePassword(password) {
  return bcrypt.hash(String(password), BCRYPT_ROUNDS);
}

export async function verifySecurePassword(password, storedHash) {
  try {
    return await bcrypt.compare(String(password), String(storedHash || ''));
  } catch {
    return false;
  }
}
