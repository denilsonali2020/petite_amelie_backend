import jwt from "jsonwebtoken";

// Access Token: Vive poco tiempo (ej. 15 minutos). Va en memoria del frontend.
export const generateAccessToken = (payload: { uuid: string }) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: "7d" });
};

// Refresh Token: Vive mucho tiempo (ej. 7 días). Va en la Cookie HttpOnly.
export const generateRefreshToken = (payload: { uuid: string }) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
};