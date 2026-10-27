import type { Response } from "express";
import { HttpError } from "./HttpError.js";

export function responseError(res: Response, error: unknown) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: "Error interno del servidor" });
}
