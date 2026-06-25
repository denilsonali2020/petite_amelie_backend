import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "petite_amelie",
      // Esta es la validación a nivel Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
    };
  },
});

// Esta función valida el archivo ANTES de subirlo
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    // Si el formato es correcto, continuamos
    cb(null, true);
  } else {
    // Si el formato es incorrecto, tiramos un error de Multer
    cb(
      new Error(
        "Formato de imagen no permitido. Solo se aceptan JPG, PNG, WebP y AVIF.",
      ),
      false,
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
