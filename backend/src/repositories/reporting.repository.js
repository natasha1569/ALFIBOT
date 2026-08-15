import { getDataSource } from '../database/data-source.js';

export const findFraudTrendRows = async (filters) => {
  const dataSource = await getDataSource();
  const query = dataSource.getRepository('FraudTrendReport')
    .createQueryBuilder('report');

  if (filters.category) query.andWhere('report.fraudCategory = :category', { category: filters.category });
  if (filters.risk) query.andWhere('report.riskLevel = :risk', { risk: filters.risk });
  if (filters.type) query.andWhere('report.type = :type', { type: filters.type });
  if (filters.period) query.andWhere("TO_CHAR(report.period, 'YYYY-MM') = :period", { period: filters.period });

  return query
    .orderBy('report.period', 'DESC')
    .addOrderBy('report.totalAnalyses', 'DESC')
    .addOrderBy('report.fraudCategory', 'ASC', 'NULLS LAST')
    .getMany();
};
