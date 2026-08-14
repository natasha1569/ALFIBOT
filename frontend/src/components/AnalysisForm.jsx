import { useEffect, useRef, useState } from "react";
import {
  createSpanishRecognition,
  isSpeechRecognitionSupported,
  stopSpeaking,
} from "../services/speech.service.js";

const TABS = [
  { key: "text", label: "Texto", icon: "bi-card-text" },
  { key: "link", label: "Enlace", icon: "bi-link-45deg" },
  { key: "image", label: "Imagen", icon: "bi-image" },
];

const MAX_TEXT_LENGTH = 5000;
const MAX_IMAGE_SIZE_MB = 6;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const VOICE_ERROR_MESSAGES = {
  "not-allowed":
    "El navegador bloqueó el micrófono. Permite el acceso al micrófono y vuelve a intentarlo.",
  "service-not-allowed":
    "El servicio de reconocimiento de voz está bloqueado en este navegador.",
  "audio-capture":
    "No se encontró un micrófono disponible. Revisa la conexión o la configuración de Windows.",
  network:
    "No se pudo conectar con el servicio de reconocimiento de voz. Revisa tu conexión a internet.",
  "no-speech":
    "No se detectó voz. Acércate al micrófono y vuelve a intentarlo.",
};

const AnalysisForm = ({ onAnalyze, isLoading }) => {
  const [activeType, setActiveType] = useState("text");
  const [textValue, setTextValue] = useState("");
  const [linkValue, setLinkValue] = useState("");
  const [imageData, setImageData] = useState(null); // { dataUrl, name, size }
  const [fileError, setFileError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // El reconocimiento ya estaba detenido.
      }
      stopSpeaking();
    };
  }, []);

  const stopListening = (useAbort = false) => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      if (useAbort) recognition.abort();
      else recognition.stop();
    } catch {
      setIsListening(false);
      setInterimTranscript("");
    }
  };

  const appendVoiceText = (transcript) => {
    if (!transcript) return;

    setTextValue((currentValue) => {
      const separator = currentValue.trim().length > 0 ? " " : "";
      return `${currentValue}${separator}${transcript}`.slice(0, MAX_TEXT_LENGTH);
    });
  };

  const getRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    recognitionRef.current = createSpanishRecognition({
      onStart: () => {
        setIsListening(true);
        setVoiceMessage("Escuchando… habla con claridad.");
      },
      onResult: ({ finalTranscript, interimTranscript: interim }) => {
        if (finalTranscript) appendVoiceText(finalTranscript);
        setInterimTranscript(interim);
      },
      onError: (event) => {
        setIsListening(false);
        setInterimTranscript("");
        if (event.error === "aborted") return;
        setVoiceMessage(
          VOICE_ERROR_MESSAGES[event.error] ||
            "No se pudo reconocer la voz. Vuelve a intentarlo.",
        );
      },
      onEnd: () => {
        setIsListening(false);
        setInterimTranscript("");
        setVoiceMessage((currentMessage) =>
          currentMessage.startsWith("Escuchando")
            ? "Dictado finalizado. Puedes revisar el texto antes de analizar."
            : currentMessage,
        );
      },
    });

    return recognitionRef.current;
  };

  const handleVoiceToggle = () => {
    if (!voiceSupported || isLoading) return;

    if (isListening) {
      setVoiceMessage("Finalizando dictado…");
      stopListening();
      return;
    }

    stopSpeaking();
    setInterimTranscript("");
    setVoiceMessage("Solicitando acceso al micrófono…");

    try {
      getRecognition()?.start();
    } catch {
      setIsListening(false);
      setVoiceMessage(
        "El micrófono ya está iniciando. Espera un momento y vuelve a pulsar el botón.",
      );
    }
  };

  const handleTabChange = (key) => {
    if (isListening) stopListening(true);
    setActiveType(key);
    setFileError("");
    setVoiceMessage("");
    setInterimTranscript("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setFileError(
        "Selecciona un archivo de imagen válido: PNG, JPG, JPEG o WEBP.",
      );
      setImageData(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setFileError(
        `La imagen pesa demasiado. Usa una captura menor a ${MAX_IMAGE_SIZE_MB} MB.`,
      );
      setImageData(null);
      return;
    }

    setFileError("");
    const reader = new FileReader();
    reader.onload = () =>
      setImageData({
        dataUrl: reader.result,
        name: file.name,
        size: file.size,
      });
    reader.onerror = () =>
      setFileError("No se pudo leer la imagen. Intenta con otro archivo.");
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    if (isListening) stopListening(true);
    setTextValue("");
    setLinkValue("");
    setImageData(null);
    setFileError("");
    setVoiceMessage("");
    setInterimTranscript("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isListening) stopListening();

    if (activeType === "text" && textValue.trim()) {
      onAnalyze("text", textValue.trim());
    } else if (activeType === "link" && linkValue.trim()) {
      onAnalyze("link", linkValue.trim());
    } else if (activeType === "image" && imageData) {
      onAnalyze("image", imageData.dataUrl);
    }
  };

  const canSubmit =
    !isLoading &&
    ((activeType === "text" && textValue.trim().length > 0) ||
      (activeType === "link" && linkValue.trim().length > 0) ||
      (activeType === "image" && Boolean(imageData)));

  const textHelp =
    activeType === "text"
      ? "Copia, escribe o dicta un anuncio, mensaje de WhatsApp, publicación o descripción de una supuesta oportunidad financiera."
      : activeType === "link"
        ? "Pega un enlace público. Para redes privadas, es mejor usar captura o copiar el texto."
        : "Sube una captura clara donde se lea el anuncio o mensaje sospechoso.";

  return (
    <section
      className="analysis-panel card border-0 shadow-sm"
      aria-labelledby="analysis-title"
    >
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
          <div>
            <p className="section-kicker mb-1">Análisis con ALFI BOT</p>
            <h2 id="analysis-title" className="h4 fw-bold mb-1">
              ¿Qué contenido deseas verificar?
            </h2>
            <p className="text-secondary mb-0">{textHelp}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <ul
            className="nav nav-pills risk-tabs mb-4"
            role="tablist"
            aria-label="Tipo de análisis"
          >
            {TABS.map((tab) => (
              <li className="nav-item" key={tab.key} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeType === tab.key}
                  className={`nav-link ${activeType === tab.key ? "active" : ""}`}
                  onClick={() => handleTabChange(tab.key)}
                  disabled={isLoading}
                >
                  <i className={`bi ${tab.icon}`}></i>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {activeType === "text" && (
            <div className="mb-4">
              <div className="voice-input-header">
                <label htmlFor="text-input" className="form-label fw-semibold mb-0">
                  Texto de la publicación, mensaje o anuncio
                </label>
                <button
                  type="button"
                  className={`btn btn-voice ${isListening ? "is-listening" : ""}`}
                  onClick={handleVoiceToggle}
                  disabled={isLoading || !voiceSupported}
                  aria-pressed={isListening}
                  title={
                    voiceSupported
                      ? "Dictar el contenido usando el micrófono"
                      : "El navegador no permite reconocimiento de voz"
                  }
                >
                  <i className={`bi ${isListening ? "bi-stop-circle-fill" : "bi-mic-fill"}`}></i>
                  {isListening ? "Detener dictado" : "Dictar con voz"}
                </button>
              </div>

              <textarea
                id="text-input"
                className="form-control form-control-lg analysis-textarea"
                value={textValue}
                onChange={(event) =>
                  setTextValue(event.target.value.slice(0, MAX_TEXT_LENGTH))
                }
                placeholder='Ej: "Invierte hoy y duplica tu dinero en una semana. Solo debes pagar inscripción y traer referidos..."'
                rows={7}
                disabled={isLoading}
              />

              {(voiceMessage || interimTranscript) && (
                <div
                  className={`voice-status ${isListening ? "is-listening" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  <span className="voice-status-icon" aria-hidden="true">
                    <i className={`bi ${isListening ? "bi-soundwave" : "bi-info-circle"}`}></i>
                  </span>
                  <span>
                    {interimTranscript
                      ? `Reconociendo: “${interimTranscript}”`
                      : voiceMessage}
                  </span>
                </div>
              )}

              {!voiceSupported && (
                <div className="voice-unsupported mt-2" role="note">
                  <i className="bi bi-browser-chrome me-2"></i>
                  El dictado no está disponible en este navegador. Usa Google
                  Chrome o Microsoft Edge actualizado.
                </div>
              )}

              <div className="d-flex justify-content-between gap-3 mt-2">
                <small className="text-secondary">
                  Puedes escribir, pegar o dictar. Mientras más contexto
                  incluyas, más útil será el análisis preventivo.
                </small>
                <small className="char-count fw-semibold">
                  {textValue.length} / {MAX_TEXT_LENGTH}
                </small>
              </div>
            </div>
          )}

          {activeType === "link" && (
            <div className="mb-4">
              <label htmlFor="link-input" className="form-label fw-semibold">
                Enlace de publicación o página web
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text">
                  <i className="bi bi-link-45deg"></i>
                </span>
                <input
                  id="link-input"
                  className="form-control"
                  type="url"
                  value={linkValue}
                  onChange={(event) => setLinkValue(event.target.value)}
                  placeholder="https://..."
                  disabled={isLoading}
                />
              </div>
              <div className="alert alert-info d-flex gap-2 mt-3 mb-0 py-2">
                <i className="bi bi-info-circle flex-shrink-0"></i>
                <small>
                  Si el enlace requiere sesión iniciada o pertenece a un grupo
                  privado, el sistema puede no leer todo el contenido. En ese
                  caso usa una captura o copia el texto.
                </small>
              </div>
            </div>
          )}

          {activeType === "image" && (
            <div className="mb-4">
              <label htmlFor="image-input" className="form-label fw-semibold">
                Captura de pantalla del anuncio o mensaje
              </label>
              <input
                id="image-input"
                className="form-control form-control-lg"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {fileError && (
                <div
                  className="alert alert-danger d-flex gap-2 mt-3 mb-0 py-2"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle flex-shrink-0"></i>
                  <small>{fileError}</small>
                </div>
              )}
              {imageData && (
                <div className="image-preview-card mt-3">
                  <img
                    src={imageData.dataUrl}
                    alt="Vista previa de la imagen a analizar"
                  />
                  <div>
                    <strong>{imageData.name}</strong>
                    <span>
                      {Math.ceil(imageData.size / 1024)} KB cargados
                      correctamente
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={handleClear}
              disabled={isLoading}
            >
              <i className="bi bi-eraser me-2"></i>
              Limpiar
            </button>
            <button
              type="submit"
              className="btn btn-alfi btn-lg px-4"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  ></span>
                  Analizando
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2"></i>
                  Analizar con ALFI BOT
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AnalysisForm;
