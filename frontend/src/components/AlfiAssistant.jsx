import { useEffect } from "react";

const STATE_CONFIG = {
  idle: {
    label: "Listo para ayudarte",
    message:
      "Pega un mensaje, enlace o captura y revisaré sus señales de riesgo.",
    image: "/alfi-robot-thinking.png",
    alt: "ALFI BOT listo para iniciar el análisis",
  },
  analyzing: {
    label: "Analizando contenido",
    message: "Estoy revisando patrones, promesas y señales de alerta…",
    image: "/alfi-robot-thinking.png",
    alt: "ALFI BOT analizando el contenido",
  },
  low: {
    label: "Riesgo bajo",
    message: "No detecté señales críticas, pero verifica siempre la fuente.",
    image: "/alfi-robot-low.png",
    alt: "ALFI BOT mostrando una señal verde de riesgo bajo",
  },
  medium: {
    label: "Precaución",
    message: "Encontré señales que requieren verificación adicional.",
    image: "/alfi-robot-medium.png",
    alt: "ALFI BOT mostrando una señal amarilla de precaución",
  },
  high: {
    label: "Alerta financiera",
    message:
      "Detecté señales críticas de posible fraude. No pagues ni compartas datos.",
    image: "/alfi-robot-high.png",
    alt: "ALFI BOT mostrando una señal roja de alerta financiera",
  },
  error: {
    label: "No se completó el análisis",
    message: "Revisa la conexión e inténtalo nuevamente.",
    image: "/alfi-robot-high.png",
    alt: "ALFI BOT mostrando una señal roja por un error de conexión",
  },
  "out-of-scope": {
    label: "Consulta informativa",
    message: "Esta consulta no corresponde al análisis de alertas financieras.",
    image: "/alfi-robot-thinking.png",
    alt: "ALFI BOT mostrando su estado informativo",
  },
};

const ASSISTANT_IMAGES = [
  "/alfi-robot-thinking.png",
  "/alfi-robot-low.png",
  "/alfi-robot-medium.png",
  "/alfi-robot-high.png",
];

export default function AlfiAssistant({ status = "idle" }) {
  const config = STATE_CONFIG[status] || STATE_CONFIG.idle;

  useEffect(() => {
    ASSISTANT_IMAGES.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  return (
    <section
      className={`alfi-assistant state-${status}`}
      aria-label="Estado de ALFI BOT"
    >
      <div className="alfi-robot-stage">
        <img
          className="alfi-robot-image"
          src={config.image}
          alt={config.alt}
          decoding="async"
        />
      </div>

      <div
        className="alfi-status-message"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="alfi-status-dot" aria-hidden="true"></span>
        <div>
          <strong>{config.label}</strong>
          <p>{config.message}</p>
        </div>
      </div>
    </section>
  );
}
