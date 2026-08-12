import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ImageValidationError,
  buildImageExtractionInput,
  normalizeImageEvidence,
  validateImageDataUri,
} from '../src/services/imageAnalysis.service.js';

function createDataUri(mimeType, bytes) {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`;
}

test('validateImageDataUri acepta PNG y devuelve información normalizada', () => {
  const pngBytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00];
  const result = validateImageDataUri(createDataUri('image/png', pngBytes));

  assert.equal(result.mimeType, 'image/png');
  assert.equal(result.byteLength, pngBytes.length);
  assert.match(result.dataUri, /^data:image\/png;base64,/);
});

test('validateImageDataUri rechaza formatos no permitidos', () => {
  const gifDataUri = createDataUri('image/gif', [0x47, 0x49, 0x46, 0x38]);

  assert.throws(
    () => validateImageDataUri(gifDataUri),
    (error) => error instanceof ImageValidationError && /PNG/.test(error.message),
  );
});

test('validateImageDataUri detecta un tipo MIME falsificado', () => {
  const jpegBytes = [0xff, 0xd8, 0xff, 0xe0, 0x00];
  const fakePng = createDataUri('image/png', jpegBytes);

  assert.throws(
    () => validateImageDataUri(fakePng),
    /no coincide con el formato/i,
  );
});

test('validateImageDataUri aplica el límite de tamaño', () => {
  const pngBytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00];

  assert.throws(
    () => validateImageDataUri(createDataUri('image/png', pngBytes), { maxBytes: 8 }),
    /tamaño máximo/i,
  );
});

test('normalizeImageEvidence limpia, limita y elimina evidencia duplicada', () => {
  const result = normalizeImageEvidence({
    ocrText: '  CRÉDITO INMEDIATO\r\nSolo con cédula  ',
    visualSignals: [' Botón de WhatsApp ', '', 'botón de whatsapp'],
    platformContext: ' Facebook Marketplace ',
    contactChannels: ['WhatsApp', 'WhatsApp'],
    financialAmounts: ['$5.000', 5000],
    institutionalElements: ['Sin RUC visible'],
  });

  assert.equal(result.extractedText, 'CRÉDITO INMEDIATO\nSolo con cédula');
  assert.deepEqual(result.visualSignals, ['Botón de WhatsApp']);
  assert.equal(result.platformContext, 'Facebook Marketplace');
  assert.deepEqual(result.contactChannels, ['WhatsApp']);
  assert.deepEqual(result.financialAmounts, ['$5.000']);
  assert.deepEqual(result.institutionalElements, ['Sin RUC visible']);
});

test('buildImageExtractionInput conserva la imagen únicamente para el backend', () => {
  const dataUri = createDataUri(
    'image/jpeg',
    [0xff, 0xd8, 0xff, 0xe0, 0x00],
  );
  const input = buildImageExtractionInput(dataUri);

  assert.equal(input[0].role, 'user');
  assert.equal(input[0].content[1].type, 'input_image');
  assert.equal(input[0].content[1].image_url, dataUri);
  assert.equal(input[0].content[1].detail, 'high');
});
