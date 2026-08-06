export function normalizeRiskLevel(value) {
  const normalized = String(value || '').toLowerCase().trim();

  if (normalized.includes('alto') || normalized.includes('high')) return 'alto';
  if (normalized.includes('medio') || normalized.includes('medium')) return 'medio';
  if (normalized.includes('bajo') || normalized.includes('low')) return 'bajo';

  return 'medio';
}

export function getAssistantState({ isAnalyzing, error, result }) {
  if (isAnalyzing) return 'analyzing';
  if (error) return 'error';
  if (result?.allowed === false) return 'out-of-scope';
  if (!result) return 'idle';

  const riskLevel = normalizeRiskLevel(result.riskLevel);
  return riskLevel === 'bajo' ? 'low' : riskLevel === 'alto' ? 'high' : 'medium';
}
