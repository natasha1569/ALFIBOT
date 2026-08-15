import 'dotenv/config';
import { getDataSource } from './src/database/data-source.js';
import { hashSecurePassword } from './src/services/password.service.js';
import {
  listUsers,
  updateUserAdministration,
} from './src/services/user.service.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  const dataSource = await getDataSource();
  const suffix = Date.now();
  const email = `afb333.${suffix}@example.com`;
  const roleRepository = dataSource.getRepository('Role');
  const userRepository = dataSource.getRepository('User');
  const auditRepository = dataSource.getRepository('AuditEvent');
  let userId = null;

  try {
    const userRole = await roleRepository.findOneBy({ name: 'usuario' });
    assert(userRole, 'No existe el rol usuario requerido por AFB-333.');

    const passwordHash = await hashSecurePassword('AlfiTest123');
    const user = await userRepository.save(userRepository.create({
      roleId: userRole.id,
      name: 'Prueba HU-17',
      email,
      phone: '0999999999',
      province: 'Pichincha',
      ageRange: '25-34',
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsVersion: '2026-08-12',
      passwordHash,
    }));
    userId = user.id;

    const users = await listUsers({ search: email });
    assert(users.length === 1, 'El listado administrativo no encontró al usuario temporal.');
    assert(users[0].role === 'usuario', 'El usuario temporal no inició con el rol usuario.');
    assert(users[0].active === true, 'El usuario temporal no inició activo.');

    const editedRole = await updateUserAdministration({
      id: userId,
      role: 'auditor',
      active: true,
    });
    assert(editedRole?.role === 'auditor', 'No se actualizó el rol del usuario.');

    const deactivated = await updateUserAdministration({
      id: userId,
      role: 'auditor',
      active: false,
    });
    assert(deactivated?.active === false, 'El usuario no quedó desactivado lógicamente.');

    const inactiveUsers = await listUsers({ search: email, active: false });
    assert(
      inactiveUsers.length === 1 && inactiveUsers[0].id === userId,
      'El filtro por estado no encontró al usuario desactivado.',
    );

    const analystRole = await roleRepository.findOneBy({ name: 'analista' });
    assert(
      !analystRole,
      'El rol analista continúa en el catálogo; ejecuta primero backend/sql/AFB-333-usuarios-accesos.sql.',
    );

    console.log(
      'AFB-333 OK: listado, filtros, edición de rol, desactivación y catálogo validados con TypeORM.',
    );
  } finally {
    if (userId) {
      await userRepository.delete({ id: userId });
      await auditRepository.delete({ tableName: 'usuarios', recordId: String(userId) });
    }
    if (dataSource.isInitialized) await dataSource.destroy();
  }
};

run().catch((error) => {
  console.error('AFB-333 ERROR:', error.message);
  process.exitCode = 1;
});
