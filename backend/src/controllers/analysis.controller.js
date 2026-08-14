import { analyzeWithAI } from '../services/openai.service.js';
import { extractLinkContext } from '../services/linkExtractor.service.js';
import {
  ImageValidationError,
  validateImageDataUri,
} from '../services/imageAnalysis.service.js';
import pool from '../config/database.js';
import {
  AppError,
  ERROR_CODES,
  logServerError,
  sendError,
} from '../errors/errorCatalog.js';

const VALID_TYPES = ['text', 'link', 'image'];
const MAX_TEXT_LENGTH = 5000;
const MAX_LINK_LENGTH = 2000;

/**
 * Convierte el nivel de riesgo generado por la IA
 * al formato permitido por PostgreSQL.
 */
const normalizeRiskLevel = (riskLevel) => {
  const value = String(riskLevel || '').trim().toLowerCase();

  const riskLevels = {
    low: 'bajo',
    bajo: 'bajo',
    medium: 'medio',
    medio: 'medio',
    high: 'alto',
    alto: 'alto',
  };

  return riskLevels[value] || 'medio';
};

/**
 * Crea una vista previa corta para mostrar en el historial.
 */
const createPreview = (type, content) => {
  if (type === 'image') {
    return 'Imagen analizada';
  }

  const cleanedContent = content.replace(/\s+/g, ' ').trim();

  return cleanedContent.length > 200
    ? `${cleanedContent.substring(0, 200)}...`
    : cleanedContent;
};

/**
 * POST /api/analysis
 * Analiza el contenido con IA y guarda el resultado en PostgreSQL.
 */
export const analyzeContent = async (req, res) => {
  let client;

  try {
    const { type, content } = req.body || {};

    if (!type || !VALID_TYPES.includes(type)) {
      return sendError(res, ERROR_CODES.INVALID_CONTENT_TYPE);
    }

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return sendError(res, ERROR_CODES.CONTENT_REQUIRED);
    }

    if (type === 'text' && content.length > MAX_TEXT_LENGTH) {
      return sendError(res, ERROR_CODES.CONTENT_TOO_LONG, {
        publicMessage: `El texto no puede superar los ${MAX_TEXT_LENGTH} caracteres.`,
      });
    }

    if (type === 'link' && content.length > MAX_LINK_LENGTH) {
      return sendError(res, ERROR_CODES.CONTENT_TOO_LONG, {
        publicMessage: 'El enlace ingresado es demasiado largo.',
      });
    }

    if (
      type === 'link' &&
      !content.trim().toLowerCase().startsWith('http://') &&
      !content.trim().toLowerCase().startsWith('https://')
    ) {
      return sendError(res, ERROR_CODES.INVALID_LINK);
    }

    let normalizedContent = content.trim();

    if (type === 'image') {
      try {
        normalizedContent = validateImageDataUri(content).dataUri;
      } catch (error) {
        if (error instanceof ImageValidationError) {
          return sendError(res, ERROR_CODES.INVALID_IMAGE, {
            publicMessage: error.message,
          });
        }

        throw error;
      }
    }

    let linkContext = null;

    if (type === 'link') {
      linkContext = await extractLinkContext(normalizedContent);
    }

    const result = await analyzeWithAI({
      type,
      content: normalizedContent,
      linkContext,
    });

    // Cuando el contenido no pertenece al ámbito financiero,
    // se devuelve el resultado pero no se guarda en el historial.
    if (result.allowed === false) {
      return res.status(200).json(result);
    }

    const riskLevel = normalizeRiskLevel(result.riskLevel);
    const fraudCategory = result.fraudCategory || null;
    const preview = createPreview(type, normalizedContent);
    const warningSigns = Array.isArray(result.warningSigns)
      ? result.warningSigns
      : [];
    const recommendations = Array.isArray(result.recommendations)
      ? result.recommendations
      : [];

    client = await pool.connect();

    await client.query('BEGIN');

    const userId = Number(req.user?.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      await client.query('ROLLBACK');
      return sendError(res, ERROR_CODES.INVALID_SESSION, {
        publicMessage: 'La sesión no contiene un usuario válido.',
      });
    }

    const analysisResult = await client.query(
      `
        INSERT INTO alfi.analisis (
          usuario_id,
          tipo,
          contenido,
          vista_previa,
          nivel_riesgo,
          categoria_fraude,
          resumen,
          permitido
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          analisis_id,
          fecha_creacion
      `,
      [
        userId,
        type,
        normalizedContent,
        preview,
        riskLevel,
        fraudCategory,
        result.summary || 'Análisis realizado correctamente.',
        true,
      ],
    );

    const savedAnalysis = analysisResult.rows[0];

    for (let index = 0; index < warningSigns.length; index += 1) {
      const warning = String(warningSigns[index] || '').trim();

      if (warning.length >= 5) {
        await client.query(
          `
            INSERT INTO alfi.senales_alerta (
              analisis_id,
              descripcion,
              orden
            )
            VALUES ($1, $2, $3)
          `,
          [savedAnalysis.analisis_id, warning, index + 1],
        );
      }
    }

    for (let index = 0; index < recommendations.length; index += 1) {
      const recommendation = String(recommendations[index] || '').trim();

      if (recommendation.length >= 5) {
        await client.query(
          `
            INSERT INTO alfi.recomendaciones (
              analisis_id,
              descripcion,
              orden
            )
            VALUES ($1, $2, $3)
          `,
          [savedAnalysis.analisis_id, recommendation, index + 1],
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      allowed: true,
      id: savedAnalysis.analisis_id,
      createdAt: savedAnalysis.fecha_creacion,
      riskLevel,
      fraudCategory,
      summary: result.summary,
      warningSigns,
      recommendations,
      disclaimer: result.disclaimer,
      ...(type === 'image'
        ? {
            extractedText: result.extractedText || '',
            imageEvidence: result.imageEvidence || null,
          }
        : {}),
    });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        logServerError('analysis.controller/rollback', rollbackError);
      }
    }

    logServerError('analysis.controller/analyzeContent', error);

    return sendError(
      res,
      error instanceof AppError ? error : ERROR_CODES.DATABASE_UNAVAILABLE,
    );
  } finally {
    if (client) {
      client.release();
    }
  }
};

/**
 * GET /api/analysis/history
 * Obtiene el historial desde PostgreSQL.
 */
export const getHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.analisis_id AS id,
        a.tipo AS type,
        a.contenido AS content,
        a.vista_previa AS preview,
        a.nivel_riesgo AS "riskLevel",
        a.categoria_fraude AS "fraudCategory",
        a.resumen AS summary,
        a.permitido AS allowed,
        a.fecha_creacion AS "createdAt",

        COALESCE(
          (
            SELECT json_agg(
              s.descripcion
              ORDER BY s.orden
            )
            FROM alfi.senales_alerta s
            WHERE s.analisis_id = a.analisis_id
          ),
          '[]'::json
        ) AS "warningSigns",

        COALESCE(
          (
            SELECT json_agg(
              r.descripcion
              ORDER BY r.orden
            )
            FROM alfi.recomendaciones r
            WHERE r.analisis_id = a.analisis_id
          ),
          '[]'::json
        ) AS recommendations

      FROM alfi.analisis a
      WHERE a.usuario_id = $1
      ORDER BY a.fecha_creacion DESC
    `, [Number(req.user.sub)]);

    return res.status(200).json(result.rows);
  } catch (error) {
    logServerError('analysis.controller/getHistory', error);

    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, {
      publicMessage: 'No se pudo obtener el historial. Intenta nuevamente.',
    });
  }
};

/**
 * DELETE /api/analysis/history
 * Borra el historial de PostgreSQL.
 *
 * Las señales y recomendaciones se eliminan automáticamente
 * gracias a ON DELETE CASCADE.
 */
export const clearHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `
        DELETE FROM alfi.analisis
        WHERE usuario_id = $1
        RETURNING analisis_id
      `,
      [Number(req.user.sub)],
    );

    return res.status(200).json({
      message: 'Historial eliminado correctamente.',
      deletedRecords: result.rowCount,
    });
  } catch (error) {
    logServerError('analysis.controller/clearHistory', error);

    return sendError(res, ERROR_CODES.DATABASE_UNAVAILABLE, {
      publicMessage: 'No se pudo borrar el historial. Intenta nuevamente.',
    });
  }
};
