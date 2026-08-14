const DEFAULT_TIMEOUT_MS = Number(process.env.LINK_FETCH_TIMEOUT_MS || 10000);
const MAX_HTML_CHARS = Number(process.env.LINK_MAX_HTML_CHARS || 700000);
const MAX_TEXT_CHARS = Number(process.env.LINK_MAX_TEXT_CHARS || 8000);
const MAX_LINKS = 25;

const BLOCKED_HOSTS = new Set(['localhost', '0.0.0.0']);

const TRACKING_PARAM_NAMES = [
  'fbclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'ad_id',
  'adset_id',
  'ad_campaign_id',
  'campaign_id',
  'campaign_name',
  'adset_name',
  'site_source_name',
  'placement',
  'gclid',
  'msclkid',
];

const isPrivateIp = (hostname) => {
  const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');

  if (BLOCKED_HOSTS.has(host)) return true;
  if (host === '::1') return true;
  if (host.startsWith('127.')) return true;
  if (host.startsWith('10.')) return true;
  if (host.startsWith('192.168.')) return true;
  if (host.startsWith('169.254.')) return true;

  const parts = host.split('.').map((p) => Number(p));
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  }

  return false;
};

const isValidHttpUrl = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    return ['http:', 'https:'].includes(parsed.protocol) && !isPrivateIp(parsed.hostname);
  } catch {
    return false;
  }
};

const normalizeWhitespace = (text) => {
  return String(text || '').replace(/\s+/g, ' ').trim();
};

const decodeBasicEntities = (text) => {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => {
      try {
        return String.fromCharCode(Number(code));
      } catch {
        return ' ';
      }
    });
};

const getFirstMatch = (html, patterns) => {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return normalizeWhitespace(decodeBasicEntities(match[1]));
  }
  return '';
};

const extractTitle = (html) => {
  return getFirstMatch(html, [/<title[^>]*>([\s\S]*?)<\/title>/i]);
};

const extractDescription = (html) => {
  return getFirstMatch(html, [
    /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i,
    /<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i,
    /<meta[^>]+content=["']([\s\S]*?)["'][^>]+property=["']og:description["'][^>]*>/i,
  ]);
};

const extractVisibleText = (html) => {
  const withoutNoise = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ');

  const withBreaks = withoutNoise
    .replace(/<\/(p|div|section|article|header|footer|nav|li|h1|h2|h3|h4|h5|h6|br|tr)>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  return normalizeWhitespace(decodeBasicEntities(withBreaks)).slice(0, MAX_TEXT_CHARS);
};

const extractImportantLinks = (html, baseUrl) => {
  const links = [];
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = regex.exec(html)) && links.length < MAX_LINKS) {
    const href = match[1];
    const label = normalizeWhitespace(decodeBasicEntities(match[2].replace(/<[^>]+>/g, ' '))).slice(0, 120);

    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }

    let absoluteUrl;
    try {
      absoluteUrl = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }

    const combined = `${label} ${absoluteUrl}`.toLowerCase();
    const isRelevant = [
      'termin',
      'condicion',
      'privacidad',
      'credito',
      'crédito',
      'manual',
      'contact',
      'quienes',
      'nosotros',
      'ayuda',
      'faq',
      'preguntas',
      'servimax',
      'favorita',
      'supermaxi',
      'megamaxi',
      'aki',
      'akí',
      'titan',
      'titán',
      'moblart',
      'maxipets',
      'ruc',
      'razon',
      'razón',
      'legal',
      'transparencia',
    ].some((word) => combined.includes(word));

    if (isRelevant) {
      links.push({ label: label || absoluteUrl, url: absoluteUrl });
    }
  }

  return links;
};

const findMatches = (text, keywords) => {
  const normalized = String(text || '').toLowerCase();
  return keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
};

const getUrlTechnicalContext = (rawUrl) => {
  let parsed = null;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return {
      queryParams: [],
      technicalSignals: [],
      suspiciousSignals: [],
    };
  }

  const queryParams = Array.from(parsed.searchParams.keys());
  const lowerQueryParams = queryParams.map((p) => p.toLowerCase());
  const trackingParams = lowerQueryParams.filter((param) => TRACKING_PARAM_NAMES.includes(param));
  const technicalSignals = [];
  const suspiciousSignals = [];
  const pathname = decodeURIComponent(parsed.pathname || '/');
  const hostname = parsed.hostname.toLowerCase();
  const pathSegments = pathname.split('/').filter(Boolean);

  if (trackingParams.length > 0) {
    technicalSignals.push(`La URL contiene parámetros de pauta o rastreo publicitario: ${trackingParams.join(', ')}.`);
  }

  if (lowerQueryParams.includes('fbclid') || String(parsed.search).toLowerCase().includes('site_source_name=fb')) {
    suspiciousSignals.push('El enlace parece provenir de una campaña o publicación de Facebook/Meta.');
  }

  if (String(parsed.search).toLowerCase().includes('utm_medium=paid') || String(parsed.search).toLowerCase().includes('paid')) {
    suspiciousSignals.push('El enlace parece provenir de pauta pagada o campaña publicitaria.');
  }

  const hasOpaquePath = pathSegments.some((segment) => {
    const clean = segment.replace(/[-_]/g, '');
    const hasLetters = /[a-zA-Z]/.test(clean);
    const hasNumbers = /\d/.test(clean);
    return clean.length >= 7 && hasLetters && hasNumbers;
  });

  if (hasOpaquePath) {
    suspiciousSignals.push('La URL usa una ruta opaca o aparentemente aleatoria, típica de landings de campaña o redirección.');
  }

  const financialWordsInUrl = ['credito', 'credit', 'prestamo', 'prestamos', 'loan', 'cash', 'dinero', 'financia', 'inversion'];
  if (financialWordsInUrl.some((word) => `${hostname} ${pathname}`.toLowerCase().includes(word))) {
    technicalSignals.push('La URL contiene palabras asociadas a crédito, préstamos, dinero o servicios financieros.');
  }

  if (hostname.endsWith('.lat') && trackingParams.length > 0) {
    suspiciousSignals.push('El dominio .lat con parámetros de pauta requiere verificación adicional de identidad institucional.');
  }

  return {
    queryParams,
    technicalSignals,
    suspiciousSignals,
  };
};

const buildSignals = ({ url, finalUrl, text, hostname, title, description, importantLinks }) => {
  const urlContext = getUrlTechnicalContext(finalUrl || url || '');
  const combined = `${url} ${finalUrl} ${hostname} ${title} ${description} ${text} ${importantLinks
    .map((l) => `${l.label} ${l.url}`)
    .join(' ')}`;

  const institutionalKeywords = [
    'términos',
    'terminos',
    'condiciones',
    'privacidad',
    'manual de crédito',
    'manual de credito',
    'call center',
    'atención al cliente',
    'atencion al cliente',
    'corporación favorita',
    'corporacion favorita',
    'servimax',
    'supermaxi',
    'megamaxi',
    'akí',
    'aki',
    'titán',
    'titan',
    'moblart',
    'maxipets',
    'ruc',
    'razón social',
    'razon social',
    'política de privacidad',
    'politica de privacidad',
    'superintendencia',
    'seps',
    'superbancos',
    'entidad financiera',
    'cooperativa regulada',
    'banco',
    'canal oficial',
  ];

  const suspiciousKeywords = [
    'sin requisitos',
    'sin buró',
    'sin buro',
    'aprobación inmediata',
    'aprobacion inmediata',
    'crédito inmediato',
    'credito inmediato',
    'solo whatsapp',
    'whatsapp',
    'telegram',
    'messenger',
    'pago anticipado',
    'anticipo',
    'inscripción',
    'inscripcion',
    'garantía previa',
    'garantia previa',
    'depósito previo',
    'deposito previo',
    'código dactilar',
    'codigo dactilar',
    'cédula',
    'cedula',
    'fbclid',
    'utm_',
    'campaign_name',
    'adset_name',
    'ad_id',
    'adset_id',
    'site_source_name',
    'landing',
    'preaprobado',
    'aplica ahora',
  ];

  const suspiciousSignals = [
    ...findMatches(combined, suspiciousKeywords),
    ...urlContext.suspiciousSignals,
  ];

  const visibleTextLength = normalizeWhitespace(text).length;
  const fetchedButPoorContent = visibleTextLength > 0 && visibleTextLength <= 40 && !title && !description && importantLinks.length === 0;
  if (fetchedButPoorContent) {
    suspiciousSignals.push('La página respondió con contenido público mínimo y no permitió verificar entidad, condiciones o respaldo institucional.');
  }

  return {
    queryParams: urlContext.queryParams,
    technicalSignals: urlContext.technicalSignals,
    institutionalSignals: findMatches(combined, institutionalKeywords),
    suspiciousSignals: Array.from(new Set(suspiciousSignals)),
  };
};

const buildFallbackContext = ({ url, reason }) => {
  let parsed = null;
  try {
    parsed = new URL(url);
  } catch {
    // ignore
  }

  const urlContext = getUrlTechnicalContext(url);

  return {
    originalUrl: url,
    finalUrl: url,
    hostname: parsed?.hostname || '',
    fetched: false,
    fetchError: reason,
    title: '',
    description: '',
    visibleText: '',
    importantLinks: [],
    queryParams: urlContext.queryParams,
    technicalSignals: urlContext.technicalSignals,
    institutionalSignals: [],
    suspiciousSignals: urlContext.suspiciousSignals,
  };
};

export const extractLinkContext = async (rawUrl) => {
  const url = String(rawUrl || '').trim();

  if (!isValidHttpUrl(url)) {
    return buildFallbackContext({
      url,
      reason: 'URL inválida, protocolo no permitido o destino local/privado bloqueado por seguridad.',
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 FraudAIChecker/1.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const finalUrl = response.url || url;
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      return buildFallbackContext({ url, reason: `La página respondió HTTP ${response.status}.` });
    }

    if (!contentType.toLowerCase().includes('text/html')) {
      return buildFallbackContext({ url, reason: `El contenido no es HTML público legible (${contentType}).` });
    }

    const rawHtml = await response.text();
    const html = rawHtml.slice(0, MAX_HTML_CHARS);
    const parsedFinalUrl = new URL(finalUrl);
    const title = extractTitle(html);
    const description = extractDescription(html);
    const visibleText = extractVisibleText(html);
    const importantLinks = extractImportantLinks(html, finalUrl);
    const signals = buildSignals({
      url,
      finalUrl,
      text: visibleText,
      hostname: parsedFinalUrl.hostname,
      title,
      description,
      importantLinks,
    });

    return {
      originalUrl: url,
      finalUrl,
      hostname: parsedFinalUrl.hostname,
      fetched: true,
      fetchError: '',
      title,
      description,
      visibleText,
      importantLinks,
      ...signals,
    };
  } catch (error) {
    const reason = error?.name === 'AbortError' ? 'Tiempo de espera agotado al intentar leer la página.' : error.message;
    return buildFallbackContext({ url, reason });
  } finally {
    clearTimeout(timeout);
  }
};
