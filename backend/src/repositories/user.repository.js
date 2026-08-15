import { ILike, In } from 'typeorm';
import { getDataSource } from '../database/data-source.js';

const withRole = (repository) => repository
  .createQueryBuilder('user')
  .innerJoinAndSelect('user.role', 'role');

export const findUserByEmailRecord = async (email) => {
  const dataSource = await getDataSource();
  return withRole(dataSource.getRepository('User'))
    .addSelect('user.passwordHash')
    .where({ email: ILike(String(email || '').trim()) })
    .getOne();
};

export const createUserRecord = async (payload) => {
  const dataSource = await getDataSource();

  return dataSource.transaction(async (manager) => {
    const role = await manager.getRepository('Role').findOneBy({ name: 'usuario' });
    if (!role) {
      const error = new Error('No existe el rol interno de usuario.');
      error.code = 'ALFI_ROLE_NOT_FOUND';
      throw error;
    }

    const interests = await manager.getRepository('FinancialInterest').findBy({
      code: In(payload.interests),
      active: true,
    });
    if (interests.length !== payload.interests.length) {
      const error = new Error('Uno o más intereses financieros no existen o están inactivos.');
      error.code = 'ALFI_INVALID_INTERESTS';
      throw error;
    }

    const userRepository = manager.getRepository('User');
    const user = await userRepository.save(userRepository.create({
      roleId: role.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      province: payload.province,
      ageRange: payload.ageRange,
      termsAccepted: payload.termsAccepted,
      termsAcceptedAt: new Date(),
      termsVersion: payload.termsVersion,
      passwordHash: payload.passwordHash,
    }));

    await manager.getRepository('UserFinancialInterest').insert(
      interests.map((interest) => ({ userId: user.id, interestId: interest.id })),
    );

    return { ...user, role };
  });
};

const buildUserWhere = ({ search, role, active }) => {
  const shared = {};
  if (role) shared.role = { name: role };
  if (active !== null) shared.active = active;

  const normalizedSearch = String(search || '').trim();
  if (!normalizedSearch) return shared;

  const pattern = `%${normalizedSearch}%`;
  return [
    { ...shared, name: ILike(pattern) },
    { ...shared, email: ILike(pattern) },
    { ...shared, phone: ILike(pattern) },
  ];
};

export const findUserRecords = async ({ search = '', role = '', active = null } = {}) => {
  const dataSource = await getDataSource();
  return dataSource.getRepository('User').find({
    where: buildUserWhere({ search, role, active }),
    relations: { role: true },
    order: { active: 'DESC', name: 'ASC', id: 'ASC' },
  });
};

export const updateUserRecord = async ({ id, role, active }) => {
  const dataSource = await getDataSource();
  return dataSource.transaction(async (manager) => {
    const roleRecord = await manager.getRepository('Role').findOneBy({ name: role });
    if (!roleRecord) return null;

    const userRepository = manager.getRepository('User');
    const user = await userRepository.findOneBy({ id });
    if (!user) return null;

    user.roleId = roleRecord.id;
    user.active = active;
    await userRepository.save(user);
    return { ...user, role: roleRecord };
  });
};
