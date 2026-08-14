import OpenAI from 'openai';
import {
  normalizeFraudCategory,
  riskLevels,
  systemPrompt,
} from '../config/aiPolicy.js';
import {
  buildImageExtractionInput,
  imageExtractionInstructions,
  normalizeImageEvidence,
  runImageAnalysisPipeline,
} from './imageAnalysis.service.js';
import {
  ERROR_CODES,
  createAppError,
  isTimeoutError,
  logServerError,
} from '../errors/errorCatalog.js';

const DEFAULT_MESSAGE =
  'Este sistema solo analiza posibles fraudes financieros digitales, estafas piramidales, inversiones sospechosas, créditos o préstamos engañosos.';
const DEFAULT_DISCLAIMER = 'Este análisis es preventivo y no constituye una acusación legal ni financiera definitiva.';

const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 35000);

const FINANCIAL_KEYWORDS = [
  'financiero',
  'financiera',
  'finanzas',
  'dinero',
  'dólar',
  'dolar',
  'usd',
  'plata',
  'inversión',
  'inversion',
  'invertir',
  'invierta',
  'rentabilidad',
  'rendimiento',
  'ganancia',
  'ganancias',
  'retorno',
  'roi',
  'crédito',
  'credito',
  'préstamo',
  'prestamo',
  'cuota',
  'interés',
  'interes',
  'tasa',
  'anticipo',
  'pago anticipado',
  'depósito',
  'deposito',
  'transferencia',
  'banco',
  'cooperativa',
  'tarjeta',
  'deuda',
  'fraude',
  'estafa',
  'pirámide',
  'piramide',
  'ponzi',
  'multinivel',
  'referido',
  'referidos',
  'afiliados',
  'trading',
  'forex',
  'cripto',
  'crypto',
  'bitcoin',
  'binance',
  'wallet',
  'broker',
  'prestamista',
  'financiamiento',
  'financiar',
  'solicitud',
  'formulario',
  'preaprobado',
  'aprobado',
  'efectivo',
  'desembolso',
  'capital',
];

let cachedClient = null;
let cachedApiKey = null;

const getClient = (apiKey) => {
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new OpenAI({ apiKey, timeout: OPENAI_TIMEOUT_MS });
    cachedApiKey = apiKey;
  }
  return cachedClient;
};

const hasFinancialSignal = (text) => {
  const normalized = String(text || '').toLowerCase();
  return FINANCIAL_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const isClearlyOutOfScope = ({ type, content, linkContext }) => {
  const normalized = String(content || '').trim().toLowerCase();

  if (!normalized) return true;

  const shortGreetings = ['hola', 'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches'];
  if (shortGreetings.includes(normalized)) return true;

  // Para texto puro sí filtramos antes de llamar a OpenAI.
  if (type === 'text' && !hasFinancialSignal(normalized)) return true;

  // Para enlaces NO rechazamos solo porque la URL no diga explícitamente “crédito” o “préstamo”.
  // Muchos anuncios financieros llegan como landings opacas de Facebook/Meta, con rutas aleatorias
  // y parámetros de campaña. En esos casos la IA debe revisar el contexto del extractor y decidir.
  if (type === 'link') return false;

  return false;
};

const formatLinkContext = (linkContext) => {
  if (!linkContext) return 'No se proporcionó contexto extraído del enlace.';

  const importantLinks = (linkContext.importantLinks || [])
    .slice(0, 12)
    .map((link) => `- ${link.label}: ${link.url}`)
    .join('\n');

  return `
INFORMACIÓN TÉCNICA DEL ENLACE:
- URL original: ${linkContext.originalUrl || ''}
- URL final: ${linkContext.finalUrl || ''}
- Dominio: ${linkContext.hostname || ''}
- ¿El backend logró leer HTML público?: ${linkContext.fetched ? 'sí' : 'no'}
- Error de lectura, si existe: ${linkContext.fetchError || 'ninguno'}
- Parámetros de URL detectados: ${(linkContext.queryParams || []).slice(0, 25).join(', ') || 'ninguno'}
- Señales técnicas detectadas por URL: ${(linkContext.technicalSignals || []).join(' | ') || 'ninguna'}

CONTENIDO EXTRAÍDO DEL SITIO:
- Título: ${linkContext.title || 'No detectado'}
- Descripción meta: ${linkContext.description || 'No detectada'}
- Señales institucionales detectadas por el extractor: ${(linkContext.institutionalSignals || []).join(', ') || 'ninguna'}
- Señales sospechosas detectadas por el extractor: ${(linkContext.suspiciousSignals || []).join(' | ') || 'ninguna'}

ENLACES RELEVANTES DETECTADOS:
${importantLinks || 'No se detectaron enlaces relevantes.'}

TEXTO VISIBLE EXTRAÍDO:
"""
${linkContext.visibleText || 'No se logró extraer texto visible.'}
"""
`.trim();
};

const buildPromptText = ({ type, content, linkContext, imageRiskContext }) => {
  if (type === 'text') {
    return `Analiza el siguiente texto de una publicación, mensaje o anuncio financiero:\n\n"""${content}"""`;
  }

  if (type === 'link') {
    return `Analiza el siguiente enlace financiero o potencialmente financiero. El usuario lo envió desde el módulo de verificación de enlaces de posibles créditos, préstamos, inversiones o fraudes digitales. El backend intentó leer el contenido público del sitio y el contexto extraído aparece abajo.

INSTRUCCIONES IMPORTANTES PARA LINKS:
- Si fetched es "sí", utiliza el contenido extraído como base del análisis y NO digas que no puedes acceder al enlace.
- Si fetched es "no", analiza la URL, dominio, ruta, parámetros, señales técnicas y error de lectura, sin inventar contenido interno.
- No marques la consulta como fuera de alcance solo porque la URL no contiene literalmente palabras como crédito, préstamo o inversión. Landings de anuncios financieros suelen usar dominios opacos, rutas aleatorias y parámetros de pauta.

${formatLinkContext(linkContext)}`;
  }

  if (type === 'image') {
    return `Analiza la siguiente imagen o captura de pantalla en busca de señales de fraude financiero, inversión engañosa, crédito sospechoso, préstamo falso o esquema piramidal.

El backend ejecutó primero una etapa independiente de visión/OCR. Usa la evidencia estructurada siguiente como apoyo y contrástala con la imagen original:

${imageRiskContext || 'No se proporcionó evidencia OCR adicional.'}`;
  }

  throw new Error(`Tipo de contenido no soportado: ${type}`);
};

const buildResponsesInput = ({ type, content, linkContext, imageRiskContext }) => {
  const parts = [
    {
      type: 'input_text',
      text: buildPromptText({
        type,
        content,
        linkContext,
        imageRiskContext,
      }),
    },
  ];

  if (type === 'image') {
    const dataUri = content.startsWith('data:') ? content : `data:image/png;base64,${content}`;
    parts.push({
      type: 'input_image',
      image_url: dataUri,
      detail: 'high',
    });
  }

  return [
    {
      role: 'user',
      content: parts,
    },
  ];
};

const extractOutputText = (response) => {
  if (response?.output_text) return response.output_text;

  const output = response?.output || [];
  for (const item of output) {
    const content = item?.content || [];
    for (const part of content) {
      if (part?.type === 'output_text' && typeof part.text === 'string') {
        return part.text;
      }
    }
  }

  return '';
};

const cleanJsonText = (raw) => {
  const text = String(raw || '').trim();
  const match = text.match(/\{[\s\S]*\}/);
  return (match ? match[0] : text)
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
};

const parseJsonResponse = (response, sourceLabel = 'La IA') => {
  const raw = extractOutputText(response);

  if (!raw) {
    throw new Error(`${sourceLabel} no devolvió contenido.`);
  }

  try {
    return JSON.parse(cleanJsonText(raw));
  } catch {
    console.error(
      `[openai.service] ${sourceLabel} devolvió una respuesta no JSON:`,
      raw.slice(0, 800),
    );
    throw new Error(`${sourceLabel} devolvió texto que no es JSON válido.`);
  }
};

export const normalizeResult = (parsed) => {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Respuesta de la IA vacía o inválida.');
  }

  if (parsed.allowed === false) {
    return {
      allowed: false,
      message: typeof parsed.message === 'string' && parsed.message.trim() ? parsed.message : DEFAULT_MESSAGE,
    };
  }

  return {
    allowed: true,
    riskLevel: riskLevels.includes(parsed.riskLevel) ? parsed.riskLevel : 'medio',
    fraudCategory: normalizeFraudCategory(parsed.fraudCategory),
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    warningSigns: Array.isArray(parsed.warningSigns) ? parsed.warningSigns.filter((s) => typeof s === 'string') : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((r) => typeof r === 'string')
      : [],
    disclaimer: typeof parsed.disclaimer === 'string' && parsed.disclaimer.trim() ? parsed.disclaimer : DEFAULT_DISCLAIMER,
  };
};

const getOpenAIErrorMessage = (error) => {
  return (
    error?.error?.message ||
    error?.response?.data?.error?.message ||
    error?.message ||
    'Error desconocido al llamar a OpenAI.'
  );
};

export const mapOpenAIError = (error) => createAppError(
  isTimeoutError(error)
    ? ERROR_CODES.AI_TIMEOUT
    : ERROR_CODES.AI_SERVICE_UNAVAILABLE,
  {
    cause: error,
    internalMessage: getOpenAIErrorMessage(error),
  },
);

const callModel = async ({ client, model, input }) => {
  const response = await client.responses.create({
    model,
    instructions: systemPrompt,
    input,
    max_output_tokens: 900,
    store: false,
  });

  return normalizeResult(parseJsonResponse(response));
};

const callImageExtractionModel = async ({ client, model, image }) => {
  const response = await client.responses.create({
    model,
    instructions: imageExtractionInstructions,
    input: buildImageExtractionInput(image.dataUri),
    max_output_tokens: 1400,
    store: false,
  });

  return normalizeImageEvidence(parseJsonResponse(response, 'El componente OCR'));
};

const analyzeUsingModel = async ({
  client,
  model,
  type,
  content,
  linkContext,
}) => {
  if (type === 'image') {
    return runImageAnalysisPipeline({
      content,
      extractEvidence: (image) => callImageExtractionModel({
        client,
        model,
        image,
      }),
      analyzeEvidence: ({ image, riskContext }) => callModel({
        client,
        model,
        input: buildResponsesInput({
          type,
          content: image.dataUri,
          imageRiskContext: riskContext,
        }),
      }),
    });
  }

  return callModel({
    client,
    model,
    input: buildResponsesInput({ type, content, linkContext }),
  });
};

export const analyzeWithAI = async ({ type, content, linkContext = null }) => {
  if (isClearlyOutOfScope({ type, content, linkContext })) {
    return {
      allowed: false,
      message: DEFAULT_MESSAGE,
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.includes('PEGA_AQUI') || apiKey === 'coloca_tu_api_key_aqui') {
    throw createAppError(ERROR_CODES.OPENAI_API_KEY_MISSING);
  }

  const primaryModel = process.env.OPENAI_MODEL || 'gpt-5-mini';
  const fallbackModel = process.env.OPENAI_FALLBACK_MODEL || null;

  const client = getClient(apiKey);

  try {
    return await analyzeUsingModel({
      client,
      model: primaryModel,
      type,
      content,
      linkContext,
    });
  } catch (primaryError) {
    logServerError(`openai.service/${primaryModel}`, primaryError);

    if (!fallbackModel || fallbackModel === primaryModel) {
      throw mapOpenAIError(primaryError);
    }

    try {
      console.warn(`[openai.service] Reintentando con el modelo de respaldo (${fallbackModel})...`);
      return await analyzeUsingModel({
        client,
        model: fallbackModel,
        type,
        content,
        linkContext,
      });
    } catch (fallbackError) {
      logServerError(`openai.service/${fallbackModel}`, fallbackError);
      throw mapOpenAIError(fallbackError);
    }
  }
};
