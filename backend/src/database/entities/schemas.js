import { EntitySchema } from 'typeorm';

export const RoleEntity = new EntitySchema({
  name: 'Role', tableName: 'roles', schema: 'alfi',
  columns: {
    id: { name: 'rol_id', type: Number, primary: true, generated: 'increment' },
    name: { name: 'nombre', type: String, length: 30, unique: true },
    description: { name: 'descripcion', type: String, length: 150 },
  },
  relations: { users: { type: 'one-to-many', target: 'User', inverseSide: 'role' } },
});

export const UserEntity = new EntitySchema({
  name: 'User', tableName: 'usuarios', schema: 'alfi',
  columns: {
    id: { name: 'usuario_id', type: Number, primary: true, generated: 'increment' },
    roleId: { name: 'rol_id', type: Number },
    name: { name: 'nombre', type: String, length: 100 },
    email: { name: 'correo', type: String, length: 120, unique: true },
    passwordHash: { name: 'password_hash', type: String, length: 255, select: false },
    active: { name: 'activo', type: Boolean, default: true },
    registeredAt: { name: 'fecha_registro', type: 'timestamp', createDate: true },
    phone: { name: 'celular', type: String, length: 10 },
    updatedAt: { name: 'fecha_actualizacion', type: 'timestamp', updateDate: true },
    province: { name: 'provincia', type: String, length: 40, nullable: true },
    ageRange: { name: 'rango_edad', type: String, length: 10, nullable: true },
    termsAccepted: { name: 'terminos_aceptados', type: Boolean, nullable: true },
    termsAcceptedAt: { name: 'terminos_aceptados_en', type: 'timestamp', nullable: true },
    termsVersion: { name: 'terminos_version', type: String, length: 20, nullable: true },
  },
  relations: {
    role: { type: 'many-to-one', target: 'Role', joinColumn: { name: 'rol_id', referencedColumnName: 'id' }, inverseSide: 'users' },
    analyses: { type: 'one-to-many', target: 'Analysis', inverseSide: 'user' },
  },
});

export const AnalysisEntity = new EntitySchema({
  name: 'Analysis', tableName: 'analisis', schema: 'alfi',
  columns: {
    id: { name: 'analisis_id', type: Number, primary: true, generated: 'increment' },
    userId: { name: 'usuario_id', type: Number },
    type: { name: 'tipo', type: String, length: 20 },
    content: { name: 'contenido', type: 'text' },
    preview: { name: 'vista_previa', type: String, length: 250, nullable: true },
    riskLevel: { name: 'nivel_riesgo', type: String, length: 10 },
    fraudCategory: { name: 'categoria_fraude', type: String, length: 40, nullable: true },
    summary: { name: 'resumen', type: 'text' },
    allowed: { name: 'permitido', type: Boolean, default: true },
    createdAt: { name: 'fecha_creacion', type: 'timestamp', createDate: true },
  },
  relations: {
    user: { type: 'many-to-one', target: 'User', joinColumn: { name: 'usuario_id', referencedColumnName: 'id' }, inverseSide: 'analyses' },
    warningSigns: { type: 'one-to-many', target: 'WarningSign', inverseSide: 'analysis', cascade: ['insert'] },
    recommendations: { type: 'one-to-many', target: 'Recommendation', inverseSide: 'analysis', cascade: ['insert'] },
  },
});

export const WarningSignEntity = new EntitySchema({
  name: 'WarningSign', tableName: 'senales_alerta', schema: 'alfi',
  columns: {
    id: { name: 'senal_id', type: Number, primary: true, generated: 'increment' },
    analysisId: { name: 'analisis_id', type: Number },
    description: { name: 'descripcion', type: String, length: 300 },
    order: { name: 'orden', type: Number, default: 1 },
  },
  relations: { analysis: { type: 'many-to-one', target: 'Analysis', joinColumn: { name: 'analisis_id', referencedColumnName: 'id' }, inverseSide: 'warningSigns', onDelete: 'CASCADE' } },
});

export const RecommendationEntity = new EntitySchema({
  name: 'Recommendation', tableName: 'recomendaciones', schema: 'alfi',
  columns: {
    id: { name: 'recomendacion_id', type: Number, primary: true, generated: 'increment' },
    analysisId: { name: 'analisis_id', type: Number },
    description: { name: 'descripcion', type: String, length: 400 },
    order: { name: 'orden', type: Number, default: 1 },
  },
  relations: { analysis: { type: 'many-to-one', target: 'Analysis', joinColumn: { name: 'analisis_id', referencedColumnName: 'id' }, inverseSide: 'recommendations', onDelete: 'CASCADE' } },
});

export const AuditEventEntity = new EntitySchema({
  name: 'AuditEvent', tableName: 'auditoria', schema: 'alfi',
  columns: {
    id: { name: 'auditoria_id', type: 'bigint', primary: true, generated: 'increment' },
    tableName: { name: 'tabla', type: String, length: 50 },
    operation: { name: 'operacion', type: String, length: 10 },
    recordId: { name: 'registro_id', type: String, length: 50 },
    databaseUser: { name: 'usuario_bd', type: String, length: 100 },
    occurredAt: { name: 'fecha_operacion', type: 'timestamp', createDate: true },
    previousData: { name: 'datos_anteriores', type: 'jsonb', nullable: true, select: false },
    newData: { name: 'datos_nuevos', type: 'jsonb', nullable: true, select: false },
  },
});

export const FinancialInterestEntity = new EntitySchema({
  name: 'FinancialInterest', tableName: 'intereses_financieros', schema: 'alfi',
  columns: {
    id: { name: 'interes_id', type: Number, primary: true, generated: 'increment' },
    code: { name: 'codigo', type: String, length: 40, unique: true },
    name: { name: 'nombre', type: String, length: 80, unique: true },
    active: { name: 'activo', type: Boolean, default: true },
    createdAt: { name: 'fecha_creacion', type: 'timestamp', createDate: true },
  },
});

export const UserFinancialInterestEntity = new EntitySchema({
  name: 'UserFinancialInterest', tableName: 'usuario_intereses_financieros', schema: 'alfi',
  columns: {
    userId: { name: 'usuario_id', type: Number, primary: true },
    interestId: { name: 'interes_id', type: Number, primary: true },
    registeredAt: { name: 'fecha_registro', type: 'timestamp', createDate: true },
  },
});

export const FraudTrendReportEntity = new EntitySchema({
  name: 'FraudTrendReport', tableName: 'vw_reporte_fraude_riesgo', schema: 'alfi', synchronize: false,
  columns: {
    period: { name: 'mes', type: 'date', primary: true },
    fraudCategory: { name: 'categoria_fraude', type: String, nullable: true, primary: true },
    riskLevel: { name: 'nivel_riesgo', type: String, primary: true },
    type: { name: 'tipo', type: String, primary: true },
    totalAnalyses: { name: 'total_analisis', type: Number },
    totalWarningSigns: { name: 'total_senales', type: Number },
    totalRecommendations: { name: 'total_recomendaciones', type: Number },
    monthlyPercentage: { name: 'porcentaje_mensual', type: 'numeric' },
  },
});

export const entities = [
  RoleEntity, UserEntity, AnalysisEntity, WarningSignEntity,
  RecommendationEntity, AuditEventEntity, FinancialInterestEntity,
  UserFinancialInterestEntity, FraudTrendReportEntity,
];
