const SPANISH_LOCALE = "es-EC";

const getRecognitionConstructor = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

export const isSpeechRecognitionSupported = () => {
  return Boolean(getRecognitionConstructor());
};

export const isSpeechSynthesisSupported = () => {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
};

export const createSpanishRecognition = (handlers = {}) => {
  const Recognition = getRecognitionConstructor();
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = SPANISH_LOCALE;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => handlers.onStart?.();
  recognition.onend = () => handlers.onEnd?.();
  recognition.onerror = (event) => handlers.onError?.(event);
  recognition.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0]?.transcript || "";
      if (event.results[index].isFinal) {
        finalTranscript += `${transcript} `;
      } else {
        interimTranscript += transcript;
      }
    }

    handlers.onResult?.({
      finalTranscript: finalTranscript.trim(),
      interimTranscript: interimTranscript.trim(),
    });
  };

  return recognition;
};

const normalizeForSpeech = (value) => {
  return String(value || "")
    .replace(/https?:\/\/\S+/gi, " enlace web ")
    .replace(/\s+/g, " ")
    .trim();
};

const voicePriority = (voice) => {
  const lang = String(voice.lang || "").toLowerCase();
  if (lang === "es-ec") return 0;
  if (lang === "es-419") return 1;
  if (lang.startsWith("es-us")) return 2;
  if (lang.startsWith("es-mx")) return 3;
  if (lang.startsWith("es-es")) return 4;
  if (lang.startsWith("es")) return 5;
  return 99;
};

export const getAvailableSpanishVoices = () => {
  if (!isSpeechSynthesisSupported()) return [];

  return window.speechSynthesis
    .getVoices()
    .filter((voice) => String(voice.lang || "").toLowerCase().startsWith("es"))
    .sort((first, second) => {
      const priorityDifference = voicePriority(first) - voicePriority(second);
      if (priorityDifference !== 0) return priorityDifference;
      return first.name.localeCompare(second.name, "es");
    });
};

const findSpanishVoice = (preferredVoiceURI = "") => {
  if (!isSpeechSynthesisSupported()) return null;

  const voices = window.speechSynthesis.getVoices();

  if (preferredVoiceURI) {
    const selectedVoice = voices.find(
      (voice) => voice.voiceURI === preferredVoiceURI,
    );
    if (selectedVoice) return selectedVoice;
  }

  return (
    voices.find((voice) => voice.lang?.toLowerCase() === "es-ec") ||
    voices.find((voice) => voice.lang?.toLowerCase() === "es-419") ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("es")) ||
    null
  );
};

export const stopSpeaking = () => {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
};

export const speakText = (
  text,
  {
    voiceURI = "",
    rate = 0.95,
    pitch = 1,
    volume = 1,
    onStart,
    onEnd,
    onError,
  } = {},
) => {
  if (!isSpeechSynthesisSupported()) {
    onError?.(new Error("La lectura por voz no está disponible en este navegador."));
    return false;
  }

  const cleanText = normalizeForSpeech(text);
  if (!cleanText) return false;

  stopSpeaking();

  const utterance = new window.SpeechSynthesisUtterance(cleanText);
  utterance.lang = SPANISH_LOCALE;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  const voice = findSpanishVoice(voiceURI);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang || SPANISH_LOCALE;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => {
    if (event.error !== "canceled" && event.error !== "interrupted") {
      onError?.(event);
    }
    onEnd?.();
  };

  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
  return true;
};

export const buildAnalysisSpeech = (result) => {
  if (!result) return "";

  if (result.allowed === false) {
    return `ALFI BOT informa: ${result.message || "La consulta está fuera del alcance del análisis."}`;
  }

  const riskLabels = {
    bajo: "Riesgo bajo.",
    medio: "Riesgo medio.",
    alto: "Riesgo alto.",
  };
  const rawRisk = String(result.riskLevel || "").toLowerCase();
  const normalizedRisk =
    rawRisk.includes("alto") || rawRisk.includes("high")
      ? "alto"
      : rawRisk.includes("bajo") || rawRisk.includes("low")
        ? "bajo"
        : "medio";
  const parts = [
    "Resultado del análisis de ALFI BOT.",
    riskLabels[normalizedRisk] || "Nivel de riesgo no determinado.",
  ];

  if (result.summary) {
    parts.push(result.summary);
  }

  if (Array.isArray(result.warningSigns) && result.warningSigns.length > 0) {
    parts.push(`Señales detectadas: ${result.warningSigns.join(". ")}.`);
  }

  if (Array.isArray(result.recommendations) && result.recommendations.length > 0) {
    parts.push(`Recomendaciones: ${result.recommendations.join(". ")}.`);
  }

  if (result.disclaimer) {
    parts.push(result.disclaimer);
  }

  return parts.join(" ");
};
