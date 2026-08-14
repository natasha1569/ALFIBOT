import { normalizeSpanishRiskLevel } from '../utils/risk.js';

const APP_NAME = 'ALFI BOT';

const RISK_LABELS = {
  bajo: 'Riesgo bajo',
  medio: 'Riesgo medio',
  alto: 'Riesgo alto',
};

const RISK_TEXT = {
  bajo: 'No se observan señales críticas, pero conviene verificar la fuente antes de tomar decisiones.',
  medio: 'Existen señales que requieren precaución y verificación adicional.',
  alto: 'El contenido presenta señales críticas. Evita entregar dinero, documentos o datos personales sin verificar.',
};

const RISK_COLORS = {
  bajo: [22, 163, 74],
  medio: [245, 158, 11],
  alto: [220, 38, 38],
};

const RISK_TINTS = {
  bajo: [220, 252, 231],
  medio: [254, 243, 199],
  alto: [254, 226, 226],
};

const ALFI_IMAGES_BY_RISK = {
  bajo: '/alfi-robot-low.png',
  medio: '/alfi-robot-medium.png',
  alto: '/alfi-robot-high.png',
};

const ALFI_PDF_MESSAGES = {
  bajo: 'ALFI BOT no detectó señales críticas, pero recomienda verificar la fuente antes de tomar decisiones financieras.',
  medio: 'ALFI BOT detectó señales que requieren precaución. Revisa la entidad, condiciones y canales oficiales antes de actuar.',
  alto: 'ALFI BOT detectó señales críticas. Evita entregar dinero, documentos o datos personales sin verificar la entidad en fuentes oficiales.',
};

const getRiskLabel = (value) => {
  const level = normalizeSpanishRiskLevel(value);
  return RISK_LABELS[level] || 'Riesgo medio';
};

const getAlfiImageForRisk = (value) => {
  const level = normalizeSpanishRiskLevel(value);
  return ALFI_IMAGES_BY_RISK[level] || ALFI_IMAGES_BY_RISK.medio;
};

const getAlfiPdfMessage = (value) => {
  const level = normalizeSpanishRiskLevel(value);
  return ALFI_PDF_MESSAGES[level] || ALFI_PDF_MESSAGES.medio;
};

const getContentTypeLabel = (type) => {
  const labels = {
    text: 'Texto ingresado por el usuario',
    link: 'Enlace o página web',
    image: 'Imagen o captura de pantalla',
  };
  return labels[type] || 'Contenido analizado';
};

const formatDate = (value = new Date()) => {
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const truncate = (value, maxLength = 900) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
};

const numberedList = (items = []) => {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
};

const getSourcePreview = (result) => {
  const source = result?.source;
  if (!source) return 'No se registró una vista previa del contenido original.';

  if (source.type === 'image') {
    return 'Se analizó una imagen o captura de pantalla cargada por el usuario. El informe PDF incluye una vista reducida de la imagen analizada.';
  }

  if (source.type === 'link') {
    return source.content || 'Enlace analizado.';
  }

  return truncate(source.content, 1100);
};

export const formatShareSummary = (result) => {
  const riskLevel = normalizeSpanishRiskLevel(result?.riskLevel);
  const lines = [
    'INFORME PREVENTIVO - ALFI BOT',
    '',
    `Nivel de riesgo: ${RISK_LABELS[riskLevel]}`,
    `Fecha del análisis: ${formatDate(result?.sharedAt || new Date())}`,
    `Tipo de contenido: ${getContentTypeLabel(result?.source?.type)}`,
    '',
    'Resumen:',
    result?.summary || 'No se generó resumen del análisis.',
  ];

  if (result?.warningSigns?.length) {
    lines.push('', 'Señales de alerta detectadas:', numberedList(result.warningSigns));
  }

  if (result?.recommendations?.length) {
    lines.push('', 'Recomendaciones preventivas:', numberedList(result.recommendations));
  }

  lines.push(
    '',
    'Contenido analizado:',
    getSourcePreview(result),
    '',
    result?.disclaimer || 'Este análisis es preventivo y no constituye una acusación legal ni financiera definitiva.',
  );

  return lines.join('\n');
};

export const buildWhatsappMessage = (result) => {
  // WhatsApp debe usar el mismo formato completo y ordenado que "Copiar resumen".
  // Así el mensaje compartido conserva nivel de riesgo, fecha, tipo de contenido,
  // resumen, señales, recomendaciones, contenido analizado y advertencia.
  return formatShareSummary(result);
};

export const buildWhatsappUrl = (result) => {
  const message = buildWhatsappMessage(result);
  return `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
};

export const openWhatsappWeb = (
  result,
  targetWindow = null,
  browserWindow = globalThis.window,
) => {
  const url = buildWhatsappUrl(result);

  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
    return url;
  }

  if (!browserWindow?.open) {
    throw new Error('El navegador no permite abrir WhatsApp Web.');
  }

  browserWindow.open(url, '_blank', 'noopener,noreferrer');
  return url;
};

export const copyShareSummary = async (
  result,
  clipboard = globalThis.navigator?.clipboard,
) => {
  if (!clipboard?.writeText) {
    throw new Error('El portapapeles no está disponible en este navegador.');
  }

  const text = formatShareSummary(result);
  await clipboard.writeText(text);
  return text;
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar la imagen para el PDF.'));
    image.src = src;
  });
};

const normalizeImageForPdf = async (dataUrl) => {
  const image = await loadImage(dataUrl);
  const maxWidth = 1050;
  const maxHeight = 720;
  const ratio = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.84),
    width,
    height,
  };
};

const escapeHtml = (value) => {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

const openPrintableReport = (result) => {
  const riskLevel = normalizeSpanishRiskLevel(result?.riskLevel);
  const riskLabel = RISK_LABELS[riskLevel];
  const riskColor = riskLevel === 'alto' ? '#dc2626' : riskLevel === 'medio' ? '#f59e0b' : '#16a34a';
  const riskTint = riskLevel === 'alto' ? '#fee2e2' : riskLevel === 'medio' ? '#fef3c7' : '#dcfce7';
  const alfiImage = getAlfiImageForRisk(riskLevel);
  const alfiMessage = getAlfiPdfMessage(riskLevel);
  const imageHtml = result?.source?.type === 'image' && result?.source?.content
    ? `<img class="source-image" src="${result.source.content}" alt="Imagen analizada" />`
    : '';

  const listHtml = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const sourcePreview = result?.source?.type === 'image' ? 'Imagen o captura de pantalla cargada por el usuario.' : getSourcePreview(result);

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Informe preventivo ALFI BOT</title>
  <style>
    body { font-family: Arial, sans-serif; color: #17213a; margin: 32px; background: #f8fafc; }
    .report { background: #ffffff; border-radius: 18px; padding: 26px; box-shadow: 0 12px 30px rgba(15, 23, 42, .08); }
    .header { display: flex; align-items: center; justify-content: flex-start; gap: 22px; border-bottom: 4px solid ${riskColor}; padding-bottom: 16px; margin-bottom: 18px; }
    .brand { font-size: 30px; font-weight: 900; letter-spacing: .04em; }
    .subtitle { color: #64748b; margin-top: 4px; font-weight: 700; }
    .alfi-print { width: 105px; height: 105px; object-fit: contain; border-radius: 22px; background: ${riskTint}; border: 1px solid #dbe3ee; padding: 8px; flex: 0 0 auto; }
    .risk-wrap { text-align: center; margin: 18px 0; }
    .risk { display: inline-block; min-width: 180px; text-align: center; padding: 12px 18px; border-radius: 12px; color: white; font-weight: 900; background: ${riskColor}; }
    .alfi-message { border: 1px solid ${riskColor}; background: ${riskTint}; border-radius: 16px; padding: 14px 16px; margin: 16px 0; font-weight: 700; }
    .box { border: 1px solid #dbe3ee; border-radius: 14px; padding: 16px; margin: 14px 0; background: #ffffff; }
    h2 { font-size: 18px; margin: 0 0 10px; }
    p, li { line-height: 1.55; }
    .source-image { max-width: 100%; max-height: 310px; object-fit: contain; border: 1px solid #dbe3ee; border-radius: 12px; display: block; margin-top: 10px; }
    .disclaimer { font-size: 12px; color: #64748b; border-top: 1px solid #dbe3ee; padding-top: 12px; margin-top: 20px; }
    @media print { body { margin: 16mm; background: #ffffff; } .report { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <main class="report">
    <div class="header">
      <img class="alfi-print" src="${alfiImage}" alt="ALFI BOT según el nivel de riesgo" />
      <div>
        <div class="brand">ALFI BOT</div>
        <div class="subtitle">Informe preventivo de riesgo financiero</div>
      </div>
    </div>
    <p><strong>Fecha:</strong> ${escapeHtml(formatDate())}</p>
    <p><strong>Tipo de contenido:</strong> ${escapeHtml(getContentTypeLabel(result?.source?.type))}</p>
    <div class="risk-wrap"><span class="risk">${escapeHtml(riskLabel)}</span></div>
    <div class="alfi-message"><strong>Mensaje de ALFI:</strong> ${escapeHtml(alfiMessage)}</div>
    <div class="box"><h2>Contenido analizado</h2><p>${escapeHtml(sourcePreview)}</p>${imageHtml}</div>
    <div class="box"><h2>Resumen</h2><p>${escapeHtml(result?.summary || '')}</p></div>
    <div class="box"><h2>Señales de alerta detectadas</h2><ol>${listHtml(result?.warningSigns)}</ol></div>
    <div class="box"><h2>Recomendaciones preventivas</h2><ol>${listHtml(result?.recommendations)}</ol></div>
    <p class="disclaimer">${escapeHtml(result?.disclaimer || 'Este análisis es preventivo y no constituye una acusación legal ni financiera definitiva.')}</p>
  </main>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 350));</script>
</body>
</html>`;

  const reportWindow = window.open('', '_blank');
  if (!reportWindow) throw new Error('El navegador bloqueó la ventana del informe. Permite ventanas emergentes para generar el PDF.');
  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
};

const loadJsPdfFromCdn = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf?.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }

    const existingScript = document.querySelector('script[data-alfi-jspdf="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.jspdf.jsPDF), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('No se pudo cargar jsPDF.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
    script.async = true;
    script.dataset.alfiJspdf = 'true';
    script.onload = () => {
      if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF);
      else reject(new Error('jsPDF no quedó disponible en el navegador.'));
    };
    script.onerror = () => reject(new Error('No se pudo cargar jsPDF desde CDN.'));
    document.head.appendChild(script);
  });
};

const sanitizeFilename = (value) => {
  return String(value || 'informe-alfi-bot')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

export const buildPdfFilename = (
  riskLevel,
  date = new Date(),
) => {
  const normalizedRisk = normalizeSpanishRiskLevel(riskLevel);
  const parsedDate = date instanceof Date ? date : new Date(date);
  const safeDate = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString().slice(0, 10)
    : parsedDate.toISOString().slice(0, 10);

  return `${sanitizeFilename(`alfi-bot-${normalizedRisk}-${safeDate}`)}.pdf`;
};

export const downloadReportPdf = async (result) => {
  try {
    const JsPDF = await loadJsPdfFromCdn();
    const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    const marginX = 16;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - marginX * 2;
    const riskLevel = normalizeSpanishRiskLevel(result?.riskLevel);
    const riskColor = RISK_COLORS[riskLevel] || RISK_COLORS.medio;
    const riskTint = RISK_TINTS[riskLevel] || RISK_TINTS.medio;

    let y = 18;

    const ensureSpace = (heightNeeded = 20) => {
      if (y + heightNeeded <= pageHeight - 16) return;
      doc.addPage();
      y = 18;
    };

    const addWrapped = (text, options = {}) => {
      const {
        fontSize = 10.5,
        color = [33, 48, 70],
        fontStyle = 'normal',
        lineHeight = 5.2,
        maxWidth = contentWidth,
        x = marginX,
      } = options;
      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ''), maxWidth);
      ensureSpace(lines.length * lineHeight + 3);
      doc.text(lines, x, y);
      y += lines.length * lineHeight + 3;
    };

    const addSectionTitle = (title) => {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(23, 33, 58);
      doc.text(title, marginX, y);
      y += 7;
    };

    const addList = (items = []) => {
      if (!items.length) {
        addWrapped('No se registraron elementos en esta sección.');
        return;
      }
      items.forEach((item, index) => {
        addWrapped(`${index + 1}. ${item}`, { maxWidth: contentWidth - 4 });
      });
    };

    doc.setFillColor(23, 33, 58);
    doc.rect(0, 0, pageWidth, 42, 'F');
    doc.setFillColor(...riskColor);
    doc.rect(0, 39, pageWidth, 3, 'F');

    const headerAlfiBoxSize = 29;
    const headerAlfiX = marginX;
    const headerAlfiY = 6;
    const headerTextX = headerAlfiX + headerAlfiBoxSize + 12;

    try {
      const normalizedAlfi = await normalizeImageForPdf(getAlfiImageForRisk(riskLevel));
      doc.setFillColor(...riskTint);
      doc.roundedRect(headerAlfiX - 2, headerAlfiY - 2, headerAlfiBoxSize + 4, headerAlfiBoxSize + 4, 6, 6, 'F');
      doc.addImage(normalizedAlfi.dataUrl, 'JPEG', headerAlfiX, headerAlfiY, headerAlfiBoxSize, headerAlfiBoxSize);
    } catch {
      // Si por alguna razón no se puede cargar ALFI, el informe se genera sin bloquear el PDF.
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(APP_NAME, headerTextX, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text('Informe preventivo de riesgo financiero', headerTextX, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Asistente inteligente de alerta financiera', headerTextX, 33);

    y = 52;
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Fecha del análisis: ${formatDate(result?.sharedAt || new Date())}`, marginX, y);
    y += 6;
    doc.text(`Tipo de contenido: ${getContentTypeLabel(result?.source?.type)}`, marginX, y);
    y += 10;

    const riskBadgeWidth = 78;
    const riskBadgeX = (pageWidth - riskBadgeWidth) / 2;
    doc.setFillColor(...riskColor);
    doc.roundedRect(riskBadgeX, y, riskBadgeWidth, 14, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(getRiskLabel(result?.riskLevel).toUpperCase(), pageWidth / 2, y + 9, { align: 'center' });
    y += 22;

    const alfiMessage = getAlfiPdfMessage(riskLevel);
    ensureSpace(26);
    doc.setFillColor(...riskTint);
    doc.setDrawColor(...riskColor);
    doc.roundedRect(marginX, y, contentWidth, 24, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...riskColor);
    doc.text('Mensaje de ALFI BOT', marginX + 5, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(33, 48, 70);
    const alfiLines = doc.splitTextToSize(alfiMessage, contentWidth - 10);
    doc.text(alfiLines, marginX + 5, y + 14);
    y += 31;

    addWrapped(RISK_TEXT[riskLevel], { fontStyle: 'bold', color: riskColor });

    addSectionTitle('Contenido analizado');
    if (result?.source?.type === 'image' && result?.source?.content) {
      addWrapped('Imagen o captura de pantalla cargada por el usuario. Se incluye una vista reducida para contexto del informe.');
      try {
        const normalizedImage = await normalizeImageForPdf(result.source.content);
        const maxImageWidthMm = 150;
        const maxImageHeightMm = 82;
        const imageRatio = normalizedImage.width / normalizedImage.height;
        let imageWidth = maxImageWidthMm;
        let imageHeight = imageWidth / imageRatio;
        if (imageHeight > maxImageHeightMm) {
          imageHeight = maxImageHeightMm;
          imageWidth = imageHeight * imageRatio;
        }
        ensureSpace(imageHeight + 10);
        doc.setDrawColor(219, 227, 238);
        doc.roundedRect(marginX, y, imageWidth, imageHeight, 3, 3);
        doc.addImage(normalizedImage.dataUrl, 'JPEG', marginX, y, imageWidth, imageHeight);
        y += imageHeight + 10;
      } catch {
        addWrapped('No se pudo insertar la imagen en el PDF, pero el análisis corresponde a la imagen cargada por el usuario.');
      }
    } else {
      addWrapped(getSourcePreview(result), { color: [71, 85, 105] });
    }

    addSectionTitle('Resumen del análisis');
    addWrapped(result?.summary || 'No se generó resumen del análisis.');

    addSectionTitle('Señales de alerta detectadas');
    addList(result?.warningSigns || []);

    addSectionTitle('Recomendaciones preventivas');
    addList(result?.recommendations || []);

    addSectionTitle('Advertencia');
    addWrapped(result?.disclaimer || 'Este análisis es preventivo y no constituye una acusación legal ni financiera definitiva.', {
      color: [100, 116, 139],
      fontSize: 9.5,
    });

    doc.save(buildPdfFilename(riskLevel));
    return { mode: 'pdf' };
  } catch (error) {
    openPrintableReport(result);
    return { mode: 'print', error };
  }
};
