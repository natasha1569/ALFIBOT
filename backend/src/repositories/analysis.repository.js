import { getDataSource } from '../database/data-source.js';

const normalizeDetails = (items = []) => items
  .filter((item) => String(item || '').trim().length >= 5)
  .map((item, index) => ({ description: String(item).trim(), order: index + 1 }));

export const saveAnalysisRecord = async (payload) => {
  const dataSource = await getDataSource();
  return dataSource.transaction(async (manager) => {
    const analysisRepository = manager.getRepository('Analysis');
    const analysis = await analysisRepository.save(analysisRepository.create({
      userId: payload.userId,
      type: payload.type,
      content: payload.content,
      preview: payload.preview,
      riskLevel: payload.riskLevel,
      fraudCategory: payload.fraudCategory,
      summary: payload.summary,
      allowed: true,
    }));

    const warningSigns = normalizeDetails(payload.warningSigns);
    const recommendations = normalizeDetails(payload.recommendations);
    if (warningSigns.length) {
      await manager.getRepository('WarningSign').insert(
        warningSigns.map((item) => ({ ...item, analysisId: analysis.id })),
      );
    }
    if (recommendations.length) {
      await manager.getRepository('Recommendation').insert(
        recommendations.map((item) => ({ ...item, analysisId: analysis.id })),
      );
    }
    return analysis;
  });
};

export const findAnalysisHistory = async (userId) => {
  const dataSource = await getDataSource();
  const analyses = await dataSource.getRepository('Analysis').find({
    where: { userId },
    relations: { warningSigns: true, recommendations: true },
    order: {
      createdAt: 'DESC',
      warningSigns: { order: 'ASC' },
      recommendations: { order: 'ASC' },
    },
  });

  return analyses.map((analysis) => ({
    id: analysis.id,
    type: analysis.type,
    content: analysis.content,
    preview: analysis.preview,
    riskLevel: analysis.riskLevel,
    fraudCategory: analysis.fraudCategory,
    summary: analysis.summary,
    allowed: analysis.allowed,
    createdAt: analysis.createdAt,
    warningSigns: analysis.warningSigns.map((item) => item.description),
    recommendations: analysis.recommendations.map((item) => item.description),
  }));
};

export const deleteAnalysisHistory = async (userId) => {
  const dataSource = await getDataSource();
  const result = await dataSource.getRepository('Analysis').delete({ userId });
  return result.affected || 0;
};

export const findAllAnalysisRecords = async () => {
  const dataSource = await getDataSource();
  return dataSource.getRepository('Analysis').find({ order: { id: 'DESC' } });
};
