import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../shared/errors/HttpError.js";

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

export const responsiveLimiter = (limit: number, minutes: number) => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max: limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response, next: NextFunction) => {
      const resetTime = (
        req as Request & { rateLimit: number & { resetTime: Date } }
      ).rateLimit?.resetTime;

      const minutesRemaining = resetTime
        ? Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60))
        : minutes;

      next(
        new HttpError(
          `Límite de intentos. Espera ${minutesRemaining} minutos antes de volver a intentarlo.`,
          429,
        ),
      );
    },
  });
};
