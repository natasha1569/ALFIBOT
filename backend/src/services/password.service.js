import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export const hashSecurePassword = (password) => {
  return bcrypt.hash(String(password), BCRYPT_ROUNDS);
};

export const verifySecurePassword = async (password, storedHash) => {
  try {
    return await bcrypt.compare(String(password), String(storedHash || ''));
  } catch {
    return false;
  }
};
