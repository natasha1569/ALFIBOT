export const FRAUD_CATEGORY_LABELS = Object.freeze({
  credito_falso: 'Crédito falso',
  ponzi: 'Esquema Ponzi',
  piramidal: 'Esquema piramidal',
  inversion_fraudulenta: 'Inversión fraudulenta',
});

export const getFraudCategoryLabel = (category) => {
  const normalizedCategory = String(category || '').trim().toLowerCase();
  return FRAUD_CATEGORY_LABELS[normalizedCategory] || null;
};
