import type { ErrorRequestHandler } from "express";
import { HttpError } from "../shared/errors/HttpError.js";

export const globalErrorHandler: ErrorRequestHandler = async (
  error,
  req,
  res,
  next,
) => {
  // Comprueba si las cabeceras de la respuesta ya fueron enviadas al cliente.
  if (res.headersSent) {
    // Si la respuesta ya comenzó, delega el error al siguiente manejador
    // para evitar intentar enviar una segunda respuesta HTTP.
    return next(error);
  }

  // Devuelve los errors manejados en los servicios
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.log(error);
  // En caso de que el servidor falle
  return res.status(500).json({ error: "Error interno del servidor." });
};
