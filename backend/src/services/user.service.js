import {
  createUserRecord,
  findUserByEmailRecord,
  findUserRecords,
  updateUserRecord,
} from '../repositories/user.repository.js';

export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: typeof user.role === 'string' ? user.role : user.role?.name,
});

const toServiceUser = (user) => user ? ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  province: user.province,
  ageRange: user.ageRange,
  passwordHash: user.passwordHash,
  active: user.active,
  role: user.role?.name,
}) : null;

export const findUserByEmail = async (email) => toServiceUser(
  await findUserByEmailRecord(email),
);

export const createRegisteredUser = async (payload) => toServiceUser(
  await createUserRecord(payload),
);

export const listUsers = async (filters = {}) => (
  await findUserRecords(filters)
).map(toServiceUser);

export const updateUserAdministration = async (payload) => toServiceUser(
  await updateUserRecord(payload),
);
