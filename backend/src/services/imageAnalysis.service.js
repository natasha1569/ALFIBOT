const DEFAULT_MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_LENGTH = 6000;
const MAX_EVIDENCE_ITEMS = 20;

export const ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

export const imageExtractionInstructions = `
Eres el componente de visión y OCR de ALFI BOT.

Tu única tarea es transcribir fielmente el texto visible y describir evidencia visual observable. No clasifiques el riesgo, no acuses a personas o entidades y no completes información que no se vea en la imagen.

Devuelve únicamente JSON válido con esta estructura exacta:
{
  "extractedText": "texto visible conservando saltos de línea útiles",
  "visualSignals": ["elemento visual observable"],
  "platformContext": "plataforma o contexto visual detectado, o cadena vacía",
  "contactChannels": ["teléfono, WhatsApp, Telegram, correo u otro canal visible"],
  "financialAmounts": ["monto, tasa, plazo o cuota visible"],
  "institutionalElements": ["logo, razón social, RUC, regulación o dato institucional visible"]
}

Si un dato no es legible, no lo inventes. Usa una cadena vacía o una lista vacía.
`.trim();

export class ImageValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

const hasExpectedSignature = (bytes, mimeType) => {
  if (mimeType === 'image/png') {
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return pngSignature.every((value, index) => bytes[index] === value);
  }

  if (mimeType === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === 'image/webp') {
    return (
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  return false;
};

const decodeStrictBase64 = (value) => {
  const compactValue = value.replace(/\s+/g, '');

  if (!compactValue || compactValue.length % 4 !== 0) {
    throw new ImageValidationError('La imagen contiene datos base64 inválidos.');
  }

  const bytes = Buffer.from(compactValue, 'base64');
  const canonicalValue = bytes.toString('base64').replace(/=+$/, '');
  const receivedValue = compactValue.replace(/=+$/, '');

  if (!bytes.length || canonicalValue !== receivedValue) {
    throw new ImageValidationError('La imagen contiene datos base64 inválidos.');
  }

  return bytes;
};

export const validateImageDataUri = (content, options = {}) => {
  const maxBytes = Number(options.maxBytes || DEFAULT_MAX_IMAGE_BYTES);
  const dataUri = String(content || '').trim();
  const match = dataUri.match(
    /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=\r\n]+)$/i,
  );

  if (!match) {
    throw new ImageValidationError(
      'La imagen debe enviarse en formato PNG, JPG/JPEG o WEBP.',
    );
  }

  const mimeType = match[1].toLowerCase();
  const bytes = decodeStrictBase64(match[2]);

  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    throw new TypeError('El límite máximo de imagen debe ser un número positivo.');
  }

  if (bytes.length > maxBytes) {
    const maxMegabytes = Math.max(1, Math.floor(maxBytes / 1024 / 1024));
    throw new ImageValidationError(
      `La imagen supera el tamaño máximo permitido de ${maxMegabytes} MB.`,
    );
  }

  if (!hasExpectedSignature(bytes, mimeType)) {
    throw new ImageValidationError(
      'El contenido del archivo no coincide con el formato de imagen declarado.',
    );
  }

  return {
    dataUri: `data:${mimeType};base64,${bytes.toString('base64')}`,
    mimeType,
    byteLength: bytes.length,
  };
};

const normalizeText = (value, maxLength = 500) => {
  return typeof value === 'string'
    ? value.replace(/\r\n/g, '\n').trim().slice(0, maxLength)
    : '';
};

const normalizeList = (value) => {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  const result = [];

  for (const item of value) {
    const normalizedItem = normalizeText(item);
    const key = normalizedItem.toLocaleLowerCase('es');

    if (!normalizedItem || seen.has(key)) continue;

    seen.add(key);
    result.push(normalizedItem);

    if (result.length >= MAX_EVIDENCE_ITEMS) break;
  }

  return result;
};

export const normalizeImageEvidence = (rawEvidence = {}) => {
  const source = rawEvidence && typeof rawEvidence === 'object'
    ? rawEvidence
    : {};

  return {
    extractedText: normalizeText(
      source.extractedText ?? source.ocrText,
      MAX_EXTRACTED_TEXT_LENGTH,
    ),
    visualSignals: normalizeList(source.visualSignals),
    platformContext: normalizeText(source.platformContext),
    contactChannels: normalizeList(source.contactChannels),
    financialAmounts: normalizeList(source.financialAmounts),
    institutionalElements: normalizeList(source.institutionalElements),
  };
};

export const buildImageExtractionInput = (dataUri) => {
  return [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: 'Extrae el texto visible y la evidencia visual de esta imagen o captura de pantalla.',
        },
        {
          type: 'input_image',
          image_url: dataUri,
          detail: 'high',
        },
      ],
    },
  ];
};

const formatEvidenceList = (items, emptyMessage) => {
  return items.length > 0
    ? items.map((item) => `- ${item}`).join('\n')
    : `- ${emptyMessage}`;
};

export const buildImageRiskContext = (rawEvidence) => {
  const evidence = normalizeImageEvidence(rawEvidence);

  return `
EVIDENCIA EXTRAÍDA DE LA IMAGEN:

TEXTO VISIBLE EXTRAÍDO MEDIANTE OCR:
"""
${evidence.extractedText || 'No se detectó texto legible.'}
"""

CONTEXTO DE PLATAFORMA:
${evidence.platformContext || 'No se identificó una plataforma específica.'}

CANALES DE CONTACTO VISIBLES:
${formatEvidenceList(evidence.contactChannels, 'No se detectaron canales de contacto.')}

MONTOS, TASAS, PLAZOS O CUOTAS VISIBLES:
${formatEvidenceList(evidence.financialAmounts, 'No se detectaron datos financieros legibles.')}

ELEMENTOS INSTITUCIONALES VISIBLES:
${formatEvidenceList(evidence.institutionalElements, 'No se detectaron elementos institucionales verificables.')}

OTRAS SEÑALES VISUALES OBSERVABLES:
${formatEvidenceList(evidence.visualSignals, 'No se registraron otras señales visuales.')}

Analiza esta evidencia junto con la imagen original. No inventes texto, entidades, condiciones ni elementos visuales que no estén presentes. Si el OCR no detectó texto, basa el análisis únicamente en los elementos visuales realmente observables.
  `.trim();
};

export const runImageAnalysisPipeline = async ({
  content,
  extractEvidence,
  analyzeEvidence,
}) => {
  if (typeof extractEvidence !== 'function') {
    throw new TypeError('La etapa de extracción OCR no está configurada.');
  }

  if (typeof analyzeEvidence !== 'function') {
    throw new TypeError('La etapa de análisis de fraude no está configurada.');
  }

  const image = validateImageDataUri(content);
  const rawEvidence = await extractEvidence(image);
  const evidence = normalizeImageEvidence(rawEvidence);
  const riskContext = buildImageRiskContext(evidence);
  const result = await analyzeEvidence({ image, evidence, riskContext });

  if (!result || typeof result !== 'object') {
    throw new Error('La etapa de análisis de fraude no devolvió un resultado válido.');
  }

  return {
    ...result,
    extractedText: evidence.extractedText,
    imageEvidence: evidence,
  };
};
