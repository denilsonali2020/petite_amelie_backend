import rateLimit from "express-rate-limit";

// Configuración del límite para endpoints sensibles (ej. Auth, Pagos)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: {
    error:
      "Límite de intentos. Espera unos minutos antes de volver a intentarlo.",
  },
  standardHeaders: true, // Devuelve la información del límite en los headers `RateLimit-*`
  legacyHeaders: false, // Desactiva los headers antiguos `X-RateLimit-*`
});

// Configuración general para endpoints públicos
export const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200,
  message: {
    error:
      "Límite de peticiones excedido. Por favor, espera 60 segundos antes de volver a intentarlo.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
