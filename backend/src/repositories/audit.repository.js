import { getDataSource } from '../database/data-source.js';

export const findAuditEvents = async (filters) => {
  const dataSource = await getDataSource();
  const query = dataSource.getRepository('AuditEvent')
    .createQueryBuilder('audit');

  if (filters.table) query.andWhere('audit.tableName = :table', { table: filters.table });
  if (filters.operation) query.andWhere('audit.operation = :operation', { operation: filters.operation });
  if (filters.from) query.andWhere('audit.occurredAt >= :from', { from: `${filters.from}T00:00:00.000Z` });
  if (filters.to) query.andWhere('audit.occurredAt < :to', {
    to: new Date(new Date(`${filters.to}T00:00:00.000Z`).getTime() + 86400000),
  });

  const [events, total] = await query
    .orderBy('audit.occurredAt', 'DESC')
    .addOrderBy('audit.id', 'DESC')
    .skip((filters.page - 1) * filters.pageSize)
    .take(filters.pageSize)
    .getManyAndCount();

  return { events, total };
};
