import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPdfFilename,
  buildWhatsappMessage,
  buildWhatsappUrl,
  copyShareSummary,
  downloadReportPdf,
  formatShareSummary,
  openWhatsappWeb,
} from '../shareReport.service.js';

const result = {
  riskLevel: 'alto',
  sharedAt: '2026-08-12T15:30:00.000Z',
  summary: 'La oferta solicita un pago anticipado.',
  warningSigns: ['Promesa de aprobación inmediata', 'Canal no oficial'],
  recommendations: ['No realizar transferencias', 'Verificar la entidad'],
  disclaimer: 'Análisis preventivo.',
  source: {
    type: 'text',
    content: 'Crédito inmediato sin requisitos a cambio de una comisión.',
  },
};

test('AFB-271 genera un resumen completo y estable', () => {
  const summary = formatShareSummary(result);

  assert.match(summary, /INFORME PREVENTIVO - ALFI BOT/);
  assert.match(summary, /Nivel de riesgo: Riesgo alto/);
  assert.match(summary, /1\. Promesa de aprobación inmediata/);
  assert.match(summary, /1\. No realizar transferencias/);
  assert.match(summary, /Crédito inmediato sin requisitos/);
  assert.match(summary, /Análisis preventivo\./);
  assert.equal(buildWhatsappMessage(result), summary);
});

test('AFB-271 codifica el informe completo para WhatsApp Web', () => {
  const url = new URL(buildWhatsappUrl(result));

  assert.equal(url.origin, 'https://web.whatsapp.com');
  assert.equal(url.pathname, '/send');
  assert.equal(url.searchParams.get('text'), formatShareSummary(result));
});

test('AFB-271 reutiliza una ventana de WhatsApp previamente abierta', () => {
  const targetWindow = { closed: false, location: { href: '' } };
  const url = openWhatsappWeb(result, targetWindow);

  assert.equal(targetWindow.location.href, url);
  assert.equal(url, buildWhatsappUrl(result));
});

test('AFB-271 abre WhatsApp Web con parámetros seguros', () => {
  const calls = [];
  const browserWindow = {
    open: (...args) => calls.push(args),
  };

  const url = openWhatsappWeb(result, null, browserWindow);

  assert.deepEqual(calls, [[url, '_blank', 'noopener,noreferrer']]);
});

test('AFB-271 copia exactamente el resumen al portapapeles', async () => {
  let copiedText = '';
  const clipboard = {
    async writeText(value) {
      copiedText = value;
    },
  };

  const text = await copyShareSummary(result, clipboard);

  assert.equal(copiedText, text);
  assert.equal(text, formatShareSummary(result));
});

test('AFB-271 genera un nombre de PDF reproducible', () => {
  assert.equal(
    buildPdfFilename('Riesgo ALTO', new Date('2026-08-12T23:59:00.000Z')),
    'alfi-bot-alto-2026-08-12.pdf',
  );
});

test('AFB-271 completa la generación y descarga lógica del PDF', async (t) => {
  const savedFiles = [];
  const previousWindow = globalThis.window;

  class FakeJsPDF {
    constructor() {
      this.internal = {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297,
        },
      };
    }

    addImage() {}
    addPage() {}
    rect() {}
    roundedRect() {}
    setDrawColor() {}
    setFillColor() {}
    setFont() {}
    setFontSize() {}
    setTextColor() {}
    splitTextToSize(value) { return [String(value)]; }
    text() {}
    save(filename) { savedFiles.push(filename); }
  }

  globalThis.window = {
    jspdf: { jsPDF: FakeJsPDF },
  };

  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });

  const response = await downloadReportPdf(result);

  assert.deepEqual(response, { mode: 'pdf' });
  assert.equal(savedFiles.length, 1);
  assert.match(savedFiles[0], /^alfi-bot-alto-\d{4}-\d{2}-\d{2}\.pdf$/);
});
