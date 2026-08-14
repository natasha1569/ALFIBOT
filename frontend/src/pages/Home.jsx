import { useCallback, useEffect, useRef, useState } from "react";
import AlfiAssistant from "../components/AlfiAssistant.jsx";
import AnalysisForm from "../components/AnalysisForm.jsx";
import HistoryList from "../components/HistoryList.jsx";
import ResultCard from "../components/ResultCard.jsx";
import ShareModal from "../components/ShareModal.jsx";
import {
  analyzeContent,
  clearHistory,
  fetchHistory,
} from "../services/api.js";
import {
  copyShareSummary,
  downloadReportPdf,
  openWhatsappWeb,
} from "../services/shareReport.service.js";
import { getAssistantState } from "../utils/risk.js";
import { normalizeHistoryItems } from "../utils/history.js";
import {
  buildAnalysisSpeech,
  getAvailableSpanishVoices,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from "../services/speech.service.js";

const VOICE_STORAGE_KEY = "alfiBotSelectedVoiceURI";

const Home = () => {
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
      setHistory(normalizeHistoryItems(data));
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

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadVoices,
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        loadVoices,
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      speechRequestRef.current += 1;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (!result || !isSpeechSynthesisSupported()) {
      return undefined;
    }

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
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }, 3500);

    return () => {
      if (resultScrollTimerRef.current) {
        clearTimeout(resultScrollTimerRef.current);
      }
    };
  }, [result]);

  const stopVoiceResponse = () => {
    speechRequestRef.current += 1;
    stopSpeaking();
    setIsSpeaking(false);
  };

  const speakAnalysisResult = (resultToSpeak) => {
    const speechText = buildAnalysisSpeech(resultToSpeak);

    if (!speechText) return;

    const requestId = speechRequestRef.current + 1;
    speechRequestRef.current = requestId;

    const updateSpeaking = (value) => {
      if (speechRequestRef.current === requestId) {
        setIsSpeaking(value);
      }
    };

    const started = speakText(speechText, {
      voiceURI: selectedVoiceURI,
      onStart: () => updateSpeaking(true),
      onEnd: () => updateSpeaking(false),
      onError: () => updateSpeaking(false),
    });

    if (!started) {
      updateSpeaking(false);
    }
  };

  const handleSpeakResult = (resultToSpeak) => {
    if (isSpeaking) {
      stopVoiceResponse();
      return;
    }

    speakAnalysisResult(resultToSpeak);
  };

  const handleVoiceChange = (event) => {
    const nextVoiceURI = event.target.value;

    stopVoiceResponse();
    setSelectedVoiceURI(nextVoiceURI);

    if (nextVoiceURI) {
      window.localStorage.setItem(
        VOICE_STORAGE_KEY,
        nextVoiceURI,
      );
    } else {
      window.localStorage.removeItem(VOICE_STORAGE_KEY);
    }
  };

  const handleTestVoice = () => {
    if (isSpeaking) {
      stopVoiceResponse();
      return;
    }

    const requestId = speechRequestRef.current + 1;
    speechRequestRef.current = requestId;

    const updateSpeaking = (value) => {
      if (speechRequestRef.current === requestId) {
        setIsSpeaking(value);
      }
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
  };

  const handleAnalyze = async (type, content) => {
    stopVoiceResponse();

    setIsAnalyzing(true);
    setError("");
    setFeedback("");
    setResult(null);

    try {
      const data = await analyzeContent({
        type,
        content,
      });

      const enrichedResult = data?.allowed
        ? {
            ...data,
            source: {
              type,
              content,
            },
            sharedAt: new Date().toISOString(),
          }
        : data;

      setResult(enrichedResult);

      if (data.allowed) {
        loadHistory();
      }
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
          if (speechRequestRef.current === requestId) {
            setIsSpeaking(true);
          }
        },

        onEnd: () => {
          if (speechRequestRef.current === requestId) {
            setIsSpeaking(false);
          }
        },

        onError: () => {
          if (speechRequestRef.current === requestId) {
            setIsSpeaking(false);
          }
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      setError(
        err.message || "No se pudo borrar el historial.",
      );
    }
  };

  const handleShare = (sharedResult) => {
    setFeedback("");
    setShareResult(sharedResult);
  };

  const handleDownloadPdf = async () => {
    if (!shareResult) return;

    setIsSharing(true);
    setFeedback("");

    try {
      const resultInfo =
        await downloadReportPdf(shareResult);

      setFeedback(
        resultInfo.mode === "pdf"
          ? "Informe PDF generado correctamente."
          : "No se pudo descargar automáticamente. Se abrió una vista para guardar como PDF desde el navegador.",
      );

      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      setFeedback(
        err.message ||
          "No se pudo generar el informe PDF.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleWhatsappShare = async () => {
    if (!shareResult) return;

    const whatsappWindow = window.open(
      "about:blank",
      "_blank",
    );

    setIsSharing(true);
    setFeedback("");

    try {
      openWhatsappWeb(
        shareResult,
        whatsappWindow,
      );

      setFeedback(
        "Se abrió WhatsApp Web con el informe preventivo listo para enviar.",
      );

      setShareResult(null);

      setTimeout(() => setFeedback(""), 3500);
    } catch (err) {
      if (
        whatsappWindow &&
        !whatsappWindow.closed
      ) {
        whatsappWindow.close();
      }

      setFeedback(
        err.message ||
          "No se pudo abrir WhatsApp Web.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopySummary = async () => {
    if (!shareResult) return;

    setIsSharing(true);
    setFeedback("");

    try {
      await copyShareSummary(shareResult);

      setFeedback(
        "Resumen preventivo copiado con formato ordenado.",
      );

      setShareResult(null);

      setTimeout(() => setFeedback(""), 3000);
    } catch {
      setFeedback(
        "No se pudo copiar automáticamente. Revisa permisos del navegador.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  const assistantState = getAssistantState({
    isAnalyzing,
    error,
    result,
  });

  return (
    <div className="app-shell">
      <main
        id="analizador"
        className="container pb-5 main-grid"
      >
        <section
          className={`analysis-workspace assistant-${assistantState}`}
          aria-label="Espacio de análisis"
        >
          <div className="assistant-form-dock">
            <div className="assistant-visual-dock">
              <AlfiAssistant
                status={assistantState}
              />
            </div>

            <div className="assistant-chat-shell">
              <AnalysisForm
                onAnalyze={handleAnalyze}
                isLoading={isAnalyzing}
              />

              <div
                className="voice-picker-panel"
                aria-label="Configuración de voz de ALFI BOT"
              >
                <div className="voice-picker-copy">
                  <span
                    className="voice-picker-icon"
                    aria-hidden="true"
                  >
                    <i className="bi bi-soundwave"></i>
                  </span>

                  <div>
                    <label
                      className="voice-picker-label"
                      htmlFor="alfi-voice-selector"
                    >
                      Voz de ALFI BOT
                    </label>

                    <small>
                      Escoge una voz disponible en tu
                      navegador y equipo.
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
                      <option value="">
                        Automática — español
                      </option>

                      {availableVoices.map(
                        (voice) => (
                          <option
                            key={voice.voiceURI}
                            value={voice.voiceURI}
                          >
                            {voice.name} —{" "}
                            {voice.lang}
                            {voice.default
                              ? " (predeterminada)"
                              : ""}
                          </option>
                        ),
                      )}
                    </select>

                    <button
                      type="button"
                      className={`btn btn-outline-primary voice-test-button ${
                        isSpeaking
                          ? "is-speaking"
                          : ""
                      }`}
                      onClick={handleTestVoice}
                    >
                      <i
                        className={`bi ${
                          isSpeaking
                            ? "bi-stop-circle-fill"
                            : "bi-play-circle-fill"
                        } me-2`}
                      ></i>

                      {isSpeaking
                        ? "Detener"
                        : "Probar voz"}
                    </button>
                  </div>
                ) : (
                  <span className="voice-unsupported">
                    La selección de voz no está
                    disponible en este navegador.
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
                speechSupported={
                  isSpeechSynthesisSupported()
                }
              />

              {!result &&
                !isAnalyzing &&
                !error && (
                  <div className="result-placeholder">
                    <span>
                      <i className="bi bi-activity"></i>
                    </span>

                    <div>
                      <strong>
                        El resultado aparecerá aquí
                      </strong>

                      <p>
                        ALFI BOT mostrará el
                        semáforo, las señales
                        detectadas y las
                        recomendaciones.
                      </p>
                    </div>
                  </div>
                )}

              {isAnalyzing && (
                <div
                  className="analysis-loading result-loading"
                  role="status"
                >
                  <div
                    className="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  ></div>

                  <span>
                    Preparando el resultado del
                    análisis…
                  </span>
                </div>
              )}
            </div>

            <aside className="col-xl-4">
              <div className="sticky-column">
                <HistoryList
                  items={history}
                  onClear={handleClearHistory}
                  isLoading={
                    isHistoryLoading
                  }
                />

                <div className="academic-note card border-0 shadow-sm mt-4">
                  <div className="card-body p-4">
                    <h2 className="h6 fw-bold">
                      <i className="bi bi-mortarboard me-2"></i>
                      MVP académico
                    </h2>

                    <p className="mb-0 text-secondary">
                      El análisis es orientativo y
                      no constituye una acusación
                      legal, financiera o
                      institucional. Verifica
                      siempre la información en
                      fuentes oficiales.
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
          if (!isSharing) {
            setShareResult(null);
          }
        }}
        onWhatsapp={handleWhatsappShare}
        onDownloadPdf={handleDownloadPdf}
        onCopySummary={handleCopySummary}
      />
    </div>
  );
};

export default Home;