const toCount = (value) => Number(value || 0);

export const aggregateReportRows = (rows = [], field) => {
  const totals = new Map();

  rows.forEach((row) => {
    const key = row?.[field] || 'sin_dato';
    totals.set(key, (totals.get(key) || 0) + toCount(row?.totalAnalyses));
  });

  return [...totals.entries()]
    .map(([key, total]) => ({ key, total }))
    .sort((left, right) => right.total - left.total || left.key.localeCompare(right.key));
};

export const buildMonthlySeries = (rows = []) => {
  const totals = new Map();

  rows.forEach((row) => {
    if (!row?.period) return;
    totals.set(
      row.period,
      (totals.get(row.period) || 0) + toCount(row.totalAnalyses),
    );
  });

  return [...totals.entries()]
    .map(([period, total]) => ({ period, total }))
    .sort((left, right) => left.period.localeCompare(right.period));
};

export const buildLineChartPoints = (
  series = [],
  { width = 720, height = 240, padding = 36 } = {},
) => {
  if (series.length === 0) return [];

  const maximum = Math.max(...series.map(({ total }) => toCount(total)), 1);
  const availableWidth = width - (padding * 2);
  const availableHeight = height - (padding * 2);

  return series.map((item, index) => {
    const x = series.length === 1
      ? width / 2
      : padding + ((availableWidth * index) / (series.length - 1));
    const y = padding + availableHeight
      - ((toCount(item.total) / maximum) * availableHeight);

    return {
      ...item,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    };
  });
};
