import { analyzeWithAI } from '../services/openai.service.js';
import { extractLinkContext } from '../services/linkExtractor.service.js';
import pool from '../config/database.js';

const VALID_TYPES = ['text', 'link', 'image'];
const MAX_TEXT_LENGTH = 5000;
const MAX_LINK_LENGTH = 2000;

/**
 * Convierte el nivel de riesgo generado por la IA
 * al formato permitido por PostgreSQL.
 */
function normalizeRiskLevel(riskLevel) {
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
}

/**
 * Crea una vista previa corta para mostrar en el historial.
 */
function createPreview(type, content) {
  if (type === 'image') {
    return 'Imagen analizada';
  }

  const cleanedContent = content.replace(/\s+/g, ' ').trim();

  return cleanedContent.length > 200
    ? `${cleanedContent.substring(0, 200)}...`
    : cleanedContent;
}

/**
 * POST /api/analysis
 * Analiza el contenido con IA y guarda el resultado en PostgreSQL.
 */
export async function analyzeContent(req, res) {
  let client;

  try {
    const { type, content } = req.body || {};

    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        error:
          'El campo "type" es obligatorio y debe ser "text", "link" o "image".',
      });
    }

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        error: 'El campo "content" es obligatorio y no puede estar vacío.',
      });
    }

    if (type === 'text' && content.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        error: `El texto no puede superar los ${MAX_TEXT_LENGTH} caracteres.`,
      });
    }

    if (type === 'link' && content.length > MAX_LINK_LENGTH) {
      return res.status(400).json({
        error: 'El enlace ingresado es demasiado largo.',
      });
    }

    if (
      type === 'link' &&
      !content.trim().toLowerCase().startsWith('http://') &&
      !content.trim().toLowerCase().startsWith('https://')
    ) {
      return res.status(400).json({
        error: 'El enlace debe comenzar con http:// o https://.',
      });
    }

    if (
      type === 'image' &&
      !content.trim().startsWith('data:image') &&
      content.trim().length < 50
    ) {
      return res.status(400).json({
        error: 'La imagen recibida no parece válida.',
      });
    }

    let linkContext = null;

    if (type === 'link') {
      linkContext = await extractLinkContext(content);
    }

    const result = await analyzeWithAI({
      type,
      content,
      linkContext,
    });

    if (result.configError) {
      return res.status(503).json({
        error: result.configError,
      });
    }

    // Cuando el contenido no pertenece al ámbito financiero,
    // se devuelve el resultado pero no se guarda en el historial.
    if (result.allowed === false) {
      return res.status(200).json(result);
    }

    const riskLevel = normalizeRiskLevel(result.riskLevel);
    const preview = createPreview(type, content);
    const warningSigns = Array.isArray(result.warningSigns)
      ? result.warningSigns
      : [];
    const recommendations = Array.isArray(result.recommendations)
      ? result.recommendations
      : [];

    client = await pool.connect();

    await client.query('BEGIN');

    // Por ahora se utiliza el usuario 1 creado en el script SQL.
    // Más adelante puede reemplazarse por req.user.usuario_id.
    const userId = 1;

    const analysisResult = await client.query(
      `
        INSERT INTO alfi.analisis (
          usuario_id,
          tipo,
          contenido,
          vista_previa,
          nivel_riesgo,
          resumen,
          permitido
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          analisis_id,
          fecha_creacion
      `,
      [
        userId,
        type,
        content.trim(),
        preview,
        riskLevel,
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
      summary: result.summary,
      warningSigns,
      recommendations,
      disclaimer: result.disclaimer,
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    console.error(
      '[analysis.controller] Error inesperado en analyzeContent:',
      error.message,
    );

    return res.status(500).json({
      error: `No se pudo completar el análisis. Detalle backend: ${error.message}`,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * GET /api/analysis/history
 * Obtiene el historial desde PostgreSQL.
 */
export async function getHistory(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        a.analisis_id AS id,
        a.tipo AS type,
        a.contenido AS content,
        a.vista_previa AS preview,
        a.nivel_riesgo AS "riskLevel",
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
      ORDER BY a.fecha_creacion DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      '[analysis.controller] Error en getHistory:',
      error.message,
    );

    return res.status(500).json({
      error: 'No se pudo obtener el historial desde PostgreSQL.',
    });
  }
}

/**
 * DELETE /api/analysis/history
 * Borra el historial de PostgreSQL.
 *
 * Las señales y recomendaciones se eliminan automáticamente
 * gracias a ON DELETE CASCADE.
 */
export async function clearHistory(req, res) {
  try {
    const result = await pool.query(`
      DELETE FROM alfi.analisis
      RETURNING analisis_id
    `);

    return res.status(200).json({
      message: 'Historial eliminado correctamente.',
      deletedRecords: result.rowCount,
    });
  } catch (error) {
    console.error(
      '[analysis.controller] Error en clearHistory:',
      error.message,
    );

    return res.status(500).json({
      error: 'No se pudo borrar el historial de PostgreSQL.',
    });
  }
}