const normalizePreview = (value) => (
  typeof value === 'string' ? value.trim() : ''
);

/**
 * Resuelve la vista previa del historial usando el contrato vigente de la API
 * (`preview`) y mantiene compatibilidad con registros antiguos
 * (`inputPreview`).
 */
export const getHistoryPreview = (item = {}) => (
  normalizePreview(item.preview) || normalizePreview(item.inputPreview)
);

export const normalizeHistoryItem = (item = {}) => ({
  ...item,
  preview: getHistoryPreview(item),
});

export const normalizeHistoryItems = (items) => (
  Array.isArray(items) ? items.map(normalizeHistoryItem) : []
);
