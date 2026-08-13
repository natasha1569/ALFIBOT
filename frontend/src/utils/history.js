function normalizePreview(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Resuelve la vista previa del historial usando el contrato vigente de la API
 * (`preview`) y mantiene compatibilidad con registros antiguos
 * (`inputPreview`).
 */
export function getHistoryPreview(item = {}) {
  return normalizePreview(item.preview) || normalizePreview(item.inputPreview);
}

export function normalizeHistoryItem(item = {}) {
  return {
    ...item,
    preview: getHistoryPreview(item),
  };
}

export function normalizeHistoryItems(items) {
  return Array.isArray(items) ? items.map(normalizeHistoryItem) : [];
}
