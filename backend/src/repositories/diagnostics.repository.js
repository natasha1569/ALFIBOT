import { getDataSource } from '../database/data-source.js';
import { findAllAnalysisRecords } from './analysis.repository.js';

export const getDatabaseStatus = async () => {
  const dataSource = await getDataSource();
  return {
    database: dataSource.options.database,
    usuario: dataSource.options.username,
    fecha: new Date(),
  };
};

export const getAnalysisDiagnostics = async () => (
  await findAllAnalysisRecords()
).map((analysis) => ({
  analisis_id: analysis.id,
  usuario_id: analysis.userId,
  tipo: analysis.type,
  contenido: analysis.content,
  vista_previa: analysis.preview,
  nivel_riesgo: analysis.riskLevel,
  resumen: analysis.summary,
  permitido: analysis.allowed,
  fecha_creacion: analysis.createdAt,
  categoria_fraude: analysis.fraudCategory,
}));
