import { analyzeWithAI } from '../services/openai.service.js';
import { extractLinkContext } from '../services/linkExtractor.service.js';
import { ImageValidationError, validateImageDataUri } from '../services/imageAnalysis.service.js';
import {
  deleteAnalysisHistory,
  findAnalysisHistory,
  saveAnalysisRecord,
} from '../repositories/analysis.repository.js';
import { AppError, ERROR_CODES, logServerError, sendError } from '../errors/errorCatalog.js';

const VALID_TYPES = ['text', 'link', 'image'];
const MAX_TEXT_LENGTH = 5000;
const MAX_LINK_LENGTH = 2000;
const normalizeRiskLevel = (riskLevel) => ({
  low: 'bajo', bajo: 'bajo', medium: 'medio', medio: 'medio', high: 'alto', alto: 'alto',
})[String(riskLevel || '').trim().toLowerCase()] || 'medio';
const createPreview = (type, content) => {
  if (type === 'image') return 'Imagen analizada';
  const cleaned = content.replace(/\s+/g, ' ').trim();
  return cleaned.length > 200 ? `${cleaned.substring(0, 200)}...` : cleaned;
};

const validateInput = (res, type, content) => {
  if (!VALID_TYPES.includes(type)) return sendError(res, ERROR_CODES.INVALID_CONTENT_TYPE);
  if (typeof content !== 'string' || !content.trim()) return sendError(res, ERROR_CODES.CONTENT_REQUIRED);
  if (type === 'text' && content.length > MAX_TEXT_LENGTH) {
    return sendError(res, ERROR_CODES.CONTENT_TOO_LONG, { publicMessage: `El texto no puede superar los ${MAX_TEXT_LENGTH} caracteres.` });
  }
  if (type === 'link' && content.length > MAX_LINK_LENGTH) {
    return sendError(res, ERROR_CODES.CONTENT_TOO_LONG, { publicMessage: 'El enlace ingresado es demasiado largo.' });
  }
  if (type === 'link' && !/^https?:\/\//i.test(content.trim())) return sendError(res, ERROR_CODES.INVALID_LINK);
  return null;
};

export const analyzeContent = async (req, res) => {
  try {
    const { type, content } = req.body || {};
    const validationResponse = validateInput(res, type, content);
    if (validationResponse) return validationResponse;

    let normalizedContent = content.trim();
    if (type === 'image') {
      try {
        normalizedContent = validateImageDataUri(content).dataUri;
      } catch (error) {
        if (error instanceof ImageValidationError) {
          return sendError(res, ERROR_CODES.INVALID_IMAGE, { publicMessage: error.message });
        }
        throw error;
      }
    }

    const linkContext = type === 'link' ? await extractLinkContext(normalizedContent) : null;
    const result = await analyzeWithAI({ type, content: normalizedContent, linkContext });
    if (result.allowed === false) return res.status(200).json(result);

    const userId = Number(req.user?.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return sendError(res, ERROR_CODES.INVALID_SESSION, { publicMessage: 'La sesión no contiene un usuario válido.' });
    }
    const riskLevel = normalizeRiskLevel(result.riskLevel);
    const warningSigns = Array.isArray(result.warningSigns) ? result.warningSigns : [];
    const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];
    const saved = await saveAnalysisRecord({
      userId,
      type,
      content: normalizedContent,
      preview: createPreview(type, normalizedContent),
      riskLevel,
      fraudCategory: result.fraudCategory || null,
      summary: result.summary || 'Análisis realizado correctamente.',
      warningSigns,
      recommendations,
    });
    return res.status(200).json({
      allowed: true,
      id: saved.id,
      createdAt: saved.createdAt,
      riskLevel,
      fraudCategory: result.fraudCategory || null,
      summary: result.summary,
      warningSigns,
      recommendations,
      disclaimer: result.disclaimer,
      ...(type === 'image' ? { extractedText: result.extractedText || '', imageEvidence: result.imageEvidence || null } : {}),
    });
  } catch (error) {
    logServerError('analysis.controller/analyzeContent', error);
    return sendError(res, error instanceof AppError ? error : ERROR_CODES.DATABASE_UNAVAILABLE);
  }
};

export const getHistory = async (req, res) => {
  try {
    return res.status(200).json(await findAnalysisHistory(Number(req.user.sub)));
  } catch (error) {
    logServerError('analysis.controller/getHistory', error);
    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, { publicMessage: 'No se pudo obtener el historial. Intenta nuevamente.' });
  }
};

export const clearHistory = async (req, res) => {
  try {
    const deletedRecords = await deleteAnalysisHistory(Number(req.user.sub));
    return res.status(200).json({ message: 'Historial eliminado correctamente.', deletedRecords });
  } catch (error) {
    logServerError('analysis.controller/clearHistory', error);
    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, { publicMessage: 'No se pudo borrar el historial. Intenta nuevamente.' });
  }
};
