import { In } from 'typeorm';
import { getDataSource } from '../database/data-source.js';

const withRole = (repository) => repository
  .createQueryBuilder('user')
  .innerJoinAndSelect('user.role', 'role');

export const findUserByEmailRecord = async (email) => {
  const dataSource = await getDataSource();
  return withRole(dataSource.getRepository('User'))
    .addSelect('user.passwordHash')
    .where('LOWER(user.email) = LOWER(:email)', { email })
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

export const findUserRecords = async ({ search = '', role = '', active = null } = {}) => {
  const dataSource = await getDataSource();
  const query = withRole(dataSource.getRepository('User'));

  if (search) {
    query.andWhere(
      '(user.name ILIKE :search OR user.email ILIKE :search OR COALESCE(user.phone, \'\') ILIKE :search)',
      { search: `%${search}%` },
    );
  }
  if (role) query.andWhere('role.name = :role', { role });
  if (active !== null) query.andWhere('user.active = :active', { active });

  return query
    .orderBy('user.active', 'DESC')
    .addOrderBy('LOWER(user.name)', 'ASC')
    .addOrderBy('user.id', 'ASC')
    .getMany();
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
