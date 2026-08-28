import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import multer from "multer";

export const handleInputErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const multerErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Msg de error de tamaño de imagen
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "La imagen no puede superar los 5 MB",
      });
    }
  }
  // Msg de formato no permitido
  if (
    error instanceof Error &&
    error.message.includes("Formato de imagen no permitido")
  ) {
    return res.status(400).json({
      error:
        "Formato de imagen no permitido. Solo se aceptan JPEG JPG, PNG, WebP y AVIF.",
    });
  }

  next(error);
};
