import { And, LessThan, MoreThanOrEqual } from 'typeorm';
import { getDataSource } from '../database/data-source.js';

const getPeriodBounds = (period) => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(period || '').trim());
  if (!match) throw new Error('Periodo de reporte inválido.');

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) throw new Error('Periodo de reporte inválido.');

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const formatMonth = (value) => String(value).padStart(2, '0');

  return {
    from: `${year}-${formatMonth(month)}-01`,
    to: `${nextYear}-${formatMonth(nextMonth)}-01`,
  };
};

export const findFraudTrendRows = async (filters) => {
  const dataSource = await getDataSource();
  const where = {};

  if (filters.category) where.fraudCategory = filters.category;
  if (filters.risk) where.riskLevel = filters.risk;
  if (filters.type) where.type = filters.type;
  if (filters.period) {
    const { from, to } = getPeriodBounds(filters.period);
    where.period = And(MoreThanOrEqual(from), LessThan(to));
  }

  return dataSource.getRepository('FraudTrendReport').find({
    where,
    order: {
      period: 'DESC',
      totalAnalyses: 'DESC',
      fraudCategory: 'ASC',
    },
  });
};
