import { Router } from 'express';
import { requirePermission } from '../middlewares/authorization.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';
import pool from '../config/database.js';

const router = Router();

const VALID_CATEGORIES = new Set([
  'credito_falso',
  'ponzi',
  'piramidal',
  'inversion_fraudulenta',
]);
const VALID_RISKS = new Set(['bajo', 'medio', 'alto']);
const VALID_TYPES = new Set(['text', 'link', 'image']);
const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const normalizeFilter = (value) => String(value || '').trim().toLowerCase();

router.get(
  '/fraud-trends',
  requirePermission(PERMISSIONS.REPORTING_READ),
  async (req, res) => {
    try {
      const category = normalizeFilter(req.query.category);
      const risk = normalizeFilter(req.query.risk);
      const type = normalizeFilter(req.query.type);
      const period = String(req.query.period || '').trim();

      if (category && !VALID_CATEGORIES.has(category)) {
        return res.status(400).json({ error: 'Categoría de fraude no válida.' });
      }

      if (risk && !VALID_RISKS.has(risk)) {
        return res.status(400).json({ error: 'Nivel de riesgo no válido.' });
      }

      if (type && !VALID_TYPES.has(type)) {
        return res.status(400).json({ error: 'Tipo de contenido no válido.' });
      }

      if (period && !PERIOD_PATTERN.test(period)) {
        return res.status(400).json({ error: 'El periodo debe tener formato YYYY-MM.' });
      }

      const conditions = [];
      const values = [];

      const addCondition = (sql, value) => {
        values.push(value);
        conditions.push(sql.replace('?', `$${values.length}`));
      };

      if (category) addCondition('categoria_fraude = ?', category);
      if (risk) addCondition('nivel_riesgo = ?', risk);
      if (type) addCondition('tipo = ?', type);
      if (period) addCondition("to_char(mes, 'YYYY-MM') = ?", period);

      const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

      const result = await pool.query(
        `
          SELECT
            to_char(mes, 'YYYY-MM') AS period,
            categoria_fraude AS "fraudCategory",
            nivel_riesgo AS "riskLevel",
            tipo AS type,
            total_analisis::integer AS "totalAnalyses",
            total_senales::integer AS "totalWarningSigns",
            total_recomendaciones::integer AS "totalRecommendations",
            porcentaje_mensual::numeric AS "monthlyPercentage"
          FROM alfi.vw_reporte_fraude_riesgo
          ${whereClause}
          ORDER BY mes DESC, total_analisis DESC, categoria_fraude NULLS LAST
        `,
        values,
      );

      const totals = result.rows.reduce(
        (accumulator, row) => ({
          totalAnalyses: accumulator.totalAnalyses + Number(row.totalAnalyses || 0),
          totalWarningSigns: accumulator.totalWarningSigns + Number(row.totalWarningSigns || 0),
          totalRecommendations: accumulator.totalRecommendations + Number(row.totalRecommendations || 0),
        }),
        { totalAnalyses: 0, totalWarningSigns: 0, totalRecommendations: 0 },
      );

      return res.status(200).json({
        filters: {
          category: category || null,
          risk: risk || null,
          type: type || null,
          period: period || null,
        },
        totals,
        rows: result.rows,
      });
    } catch (error) {
      console.error('[reporting/fraud-trends]', error.message);
      return res.status(500).json({
        error: 'No se pudo consultar la reportería agregada de fraudes.',
      });
    }
  },
);

export default router;
