import { useCallback, useEffect, useRef, useState } from "react";
import AlfiAssistant from "../components/AlfiAssistant.jsx";
import AnalysisForm from "../components/AnalysisForm.jsx";
import HistoryList from "../components/HistoryList.jsx";
import ResultCard from "../components/ResultCard.jsx";
import ShareModal from "../components/ShareModal.jsx";
import { analyzeContent, clearHistory, fetchHistory } from "../services/api.js";
import { copyShareSummary, downloadReportPdf, openWhatsappWeb } from "../services/shareReport.service.js";
import { getAssistantState } from "../utils/risk.js";
import {
  buildAnalysisSpeech,
  getAvailableSpanishVoices,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from "../services/speech.service.js";

const VOICE_STORAGE_KEY = "alfiBotSelectedVoiceURI";

export default function Home() {
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [shareResult, setShareResult] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(VOICE_STORAGE_KEY) || "";
  });
  const resultSectionRef = useRef(null);
  const resultScrollTimerRef = useRef(null);
  const speechRequestRef = useRef(0);

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return undefined;

    const loadVoices = () => {
      setAvailableVoices(getAvailableSpanishVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    return () => {
      speechRequestRef.current += 1;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (!result || !isSpeechSynthesisSupported()) return undefined;

    const voiceTimer = window.setTimeout(() => {
      speakAnalysisResult(result);
    }, 500);

    return () => window.clearTimeout(voiceTimer);
  }, [result]);

  useEffect(() => {
    if (!result) return undefined;

    if (resultScrollTimerRef.current) {
      clearTimeout(resultScrollTimerRef.current);
    }

    resultScrollTimerRef.current = window.setTimeout(() => {
      resultSectionRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      });
    }, 3500);

    return () => {
      if (resultScrollTimerRef.current) {
        clearTimeout(resultScrollTimerRef.current);
      }
    };
  }, [result]);

  function stopVoiceResponse() {
    speechRequestRef.current += 1;
    stopSpeaking();
    setIsSpeaking(false);
  }

  function speakAnalysisResult(resultToSpeak) {
    const speechText = buildAnalysisSpeech(resultToSpeak);
    if (!speechText) return;

    const requestId = speechRequestRef.current + 1;
    speechRequestRef.current = requestId;

    const updateSpeaking = (value) => {
      if (speechRequestRef.current === requestId) setIsSpeaking(value);
    };

    const started = speakText(speechText, {
      voiceURI: selectedVoiceURI,
      onStart: () => updateSpeaking(true),
      onEnd: () => updateSpeaking(false),
      onError: () => updateSpeaking(false),
    });

    if (!started) updateSpeaking(false);
  }

  function handleSpeakResult(resultToSpeak) {
    if (isSpeaking) {
      stopVoiceResponse();
      return;
    }

    speakAnalysisResult(resultToSpeak);
  }

  function handleVoiceChange(event) {
    const nextVoiceURI = event.target.value;
    stopVoiceResponse();
    setSelectedVoiceURI(nextVoiceURI);

    if (nextVoiceURI) {
      window.localStorage.setItem(VOICE_STORAGE_KEY, nextVoiceURI);
    } else {
      window.localStorage.removeItem(VOICE_STORAGE_KEY);
    }
  }

  function handleTestVoice() {
    if (isSpeaking) {
      stopVoiceResponse();
      return;
    }

    const requestId = speechRequestRef.current + 1;
    speechRequestRef.current = requestId;

    const updateSpeaking = (value) => {
      if (speechRequestRef.current === requestId) setIsSpeaking(value);
    };

    speakText(
      "Hola, soy ALFI BOT. Esta es una prueba de la voz seleccionada.",
      {
        voiceURI: selectedVoiceURI,
        onStart: () => updateSpeaking(true),
        onEnd: () => updateSpeaking(false),
        onError: () => updateSpeaking(false),
      },
    );
  }

  async function handleAnalyze(type, content) {
    stopVoiceResponse();
    setIsAnalyzing(true);
    setError("");
    setFeedback("");
    setResult(null);

    try {
      const data = await analyzeContent({ type, content });
      const enrichedResult = data?.allowed
        ? {
            ...data,
            source: { type, content },
            sharedAt: new Date().toISOString(),
          }
        : data;
      setResult(enrichedResult);
      if (data.allowed) loadHistory();
    } catch (err) {
      const errorMessage =
        err.message ||
        "No se pudo completar el análisis. Revisa que el backend esté corriendo.";
      setError(errorMessage);
      const requestId = speechRequestRef.current + 1;
      speechRequestRef.current = requestId;
      speakText(`ALFI BOT informa: ${errorMessage}`, {
        voiceURI: selectedVoiceURI,
        onStart: () => {
          if (speechRequestRef.current === requestId) setIsSpeaking(true);
        },
        onEnd: () => {
          if (speechRequestRef.current === requestId) setIsSpeaking(false);
        },
        onError: () => {
          if (speechRequestRef.current === requestId) setIsSpeaking(false);
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleClearHistory() {
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      setError(err.message || "No se pudo borrar el historial.");
    }
  }

  function handleShare(sharedResult) {
    setFeedback("");
    setShareResult(sharedResult);
  }

  async function handleDownloadPdf() {
    if (!shareResult) return;

    setIsSharing(true);
    setFeedback("");
    try {
      const resultInfo = await downloadReportPdf(shareResult);
      setFeedback(
        resultInfo.mode === "pdf"
          ? "Informe PDF generado correctamente."
          : "No se pudo descargar automáticamente. Se abrió una vista para guardar como PDF desde el navegador.",
      );
      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      setFeedback(err.message || "No se pudo generar el informe PDF.");
    } finally {
      setIsSharing(false);
    }
  }

  async function handleWhatsappShare() {
    if (!shareResult) return;

    const whatsappWindow = window.open("about:blank", "_blank");
    setIsSharing(true);
    setFeedback("");

    try {
      openWhatsappWeb(shareResult, whatsappWindow);
      setFeedback(
        "Se abrió WhatsApp Web con el informe preventivo listo para enviar.",
      );
      setShareResult(null);
      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close();
      setFeedback(err.message || "No se pudo abrir WhatsApp Web.");
    } finally {
      setIsSharing(false);
    }
  }

  async function handleCopySummary() {
    if (!shareResult) return;

    setIsSharing(true);
    setFeedback("");
    try {
      await copyShareSummary(shareResult);
      setFeedback("Resumen preventivo copiado con formato ordenado.");
      setShareResult(null);
      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback("No se pudo copiar automáticamente. Revisa permisos del navegador.");
    } finally {
      setIsSharing(false);
    }
  }

  const assistantState = getAssistantState({ isAnalyzing, error, result });

  return (
    <div className="app-shell">
      <header className="hero-section">
        <div className="container py-4 py-lg-5">
          <div className="hero-layout">
            <div className="hero-content">
              <div className="hero-badge mb-3">
                <i className="bi bi-shield-check"></i>
                Aplicación preventiva con inteligencia artificial
              </div>

              <div className="hero-brand-row">
                <div className="hero-brand">
                  <p className="hero-eyebrow">ALFI BOT · Alertas Financieras</p>
                  <h1 className="hero-title hero-title-app">ALFI BOT</h1>
                </div>
                <img
                  className="brand-mini-robot"
                  src="/alfi-robot-mini.png"
                  alt="Robot ALFI BOT de cuerpo entero"
                />
              </div>

              <p className="hero-tagline">
                Detecta señales de riesgo antes de tomar una decisión financiera.
              </p>
              <p className="hero-copy">
                Analiza textos, enlaces y capturas sospechosas para identificar
                patrones comunes de estafas, créditos falsos e inversiones
                engañosas. Recibe un nivel de riesgo claro y recomendaciones
                preventivas antes de compartir datos o realizar pagos.
              </p>

              <div className="hero-actions">
                <a className="btn btn-alfi btn-lg" href="#analizador">
                  <i className="bi bi-search me-2"></i>
                  Analizar contenido ahora
                </a>
                <a className="btn btn-outline-alfi btn-lg" href="#como-funciona">
                  <i className="bi bi-play-circle me-2"></i>
                  Ver cómo funciona
                </a>
              </div>
            </div>

            <figure className="hero-finance-visual" aria-label="Panel financiero preventivo de ALFI BOT">
              <img
                src="/alfi-finance-hero.png"
                alt="ALFI BOT saludando entre gráficos de análisis de riesgo, alertas financieras y protección"
              />
            </figure>
          </div>

          <div
            className="app-capability-grid"
            id="como-funciona"
            aria-label="Cómo funciona ALFI BOT"
          >
            <article className="app-capability-card">
              <span className="capability-icon">
                <i className="bi bi-input-cursor-text"></i>
              </span>
              <div>
                <strong>1. Ingresa el contenido</strong>
                <small>Texto, enlace o captura.</small>
              </div>
            </article>
            <article className="app-capability-card">
              <span className="capability-icon">
                <i className="bi bi-cpu"></i>
              </span>
              <div>
                <strong>2. ALFI BOT lo analiza</strong>
                <small>Busca patrones y señales de riesgo.</small>
              </div>
            </article>
            <article className="app-capability-card">
              <span className="capability-icon">
                <i className="bi bi-bell"></i>
              </span>
              <div>
                <strong>3. Recibe una alerta clara</strong>
                <small>Nivel de riesgo y recomendaciones.</small>
              </div>
            </article>
          </div>
        </div>
      </header>

      <main id="analizador" className="container pb-5 main-grid">
        <div className="app-section-heading">
          <p className="section-kicker mb-1">Herramienta principal</p>
          <h2>Verifica el contenido con la ayuda de ALFI BOT</h2>
          <p>
            El robot te acompaña durante el análisis y cambia su señal visual
            según el resultado real.
          </p>
        </div>

        <section
          className={`analysis-workspace assistant-${assistantState}`}
          aria-label="Espacio de análisis"
        >
          <div className="assistant-form-dock">
            <div className="assistant-visual-dock">
              <AlfiAssistant status={assistantState} />
            </div>

            <div className="assistant-chat-shell">
              <AnalysisForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

              <div className="voice-picker-panel" aria-label="Configuración de voz de ALFI BOT">
                <div className="voice-picker-copy">
                  <span className="voice-picker-icon" aria-hidden="true">
                    <i className="bi bi-soundwave"></i>
                  </span>
                  <div>
                    <label className="voice-picker-label" htmlFor="alfi-voice-selector">
                      Voz de ALFI BOT
                    </label>
                    <small>
                      Escoge una voz disponible en tu navegador y equipo.
                    </small>
                  </div>
                </div>

                {isSpeechSynthesisSupported() ? (
                  <div className="voice-picker-controls">
                    <select
                      id="alfi-voice-selector"
                      className="form-select voice-picker-select"
                      value={selectedVoiceURI}
                      onChange={handleVoiceChange}
                      aria-label="Seleccionar voz de ALFI BOT"
                    >
                      <option value="">Automática — español</option>
                      {availableVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} — {voice.lang}
                          {voice.default ? " (predeterminada)" : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={`btn btn-outline-primary voice-test-button ${isSpeaking ? "is-speaking" : ""}`}
                      onClick={handleTestVoice}
                    >
                      <i className={`bi ${isSpeaking ? "bi-stop-circle-fill" : "bi-play-circle-fill"} me-2`}></i>
                      {isSpeaking ? "Detener" : "Probar voz"}
                    </button>
                  </div>
                ) : (
                  <span className="voice-unsupported">
                    La selección de voz no está disponible en este navegador.
                  </span>
                )}
              </div>

              {error && (
                <div
                  className="alert alert-danger d-flex gap-2 align-items-start mt-3 shadow-sm"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{error}</div>
                </div>
              )}
              {feedback && (
                <div
                  className="alert alert-success d-flex gap-2 align-items-start mt-3 shadow-sm"
                  role="status"
                >
                  <i className="bi bi-clipboard-check-fill flex-shrink-0"></i>
                  <div>{feedback}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          id="resultado-analisis"
          ref={resultSectionRef}
          className="result-history-layout mt-4"
          aria-label="Resultado e historial"
        >
          <div className="row g-4 align-items-start">
            <div className="col-xl-8">
              <ResultCard
                result={result}
                onShare={handleShare}
                onSpeak={handleSpeakResult}
                isSpeaking={isSpeaking}
                speechSupported={isSpeechSynthesisSupported()}
              />
              {!result && !isAnalyzing && !error && (
                <div className="result-placeholder">
                  <span>
                    <i className="bi bi-activity"></i>
                  </span>
                  <div>
                    <strong>El resultado aparecerá aquí</strong>
                    <p>
                      ALFI BOT mostrará el semáforo, las señales detectadas y
                      las recomendaciones.
                    </p>
                  </div>
                </div>
              )}
              {isAnalyzing && (
                <div className="analysis-loading result-loading" role="status">
                  <div
                    className="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  ></div>
                  <span>Preparando el resultado del análisis…</span>
                </div>
              )}
            </div>

            <aside className="col-xl-4">
              <div className="sticky-column">
                <HistoryList
                  items={history}
                  onClear={handleClearHistory}
                  isLoading={isHistoryLoading}
                />
                <div className="academic-note card border-0 shadow-sm mt-4">
                  <div className="card-body p-4">
                    <h2 className="h6 fw-bold">
                      <i className="bi bi-mortarboard me-2"></i>MVP académico
                    </h2>
                    <p className="mb-0 text-secondary">
                      El análisis es orientativo y no constituye una acusación
                      legal, financiera o institucional. Verifica siempre la
                      información en fuentes oficiales.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <ShareModal
        result={shareResult}
        isWorking={isSharing}
        onClose={() => {
          if (!isSharing) setShareResult(null);
        }}
        onWhatsapp={handleWhatsappShare}
        onDownloadPdf={handleDownloadPdf}
        onCopySummary={handleCopySummary}
      />
    </div>
  );
}
