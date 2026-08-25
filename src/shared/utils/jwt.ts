import jwt from "jsonwebtoken";

// Access Token: duración temporal de desarrollo.
// En producción debe configurarse con una duración corta.
export const generateAccessToken = (payload: { uuid: string }) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: "7d" });
};

// Refresh Token: duración larga.
// Se almacena en una Cookie HttpOnly.
export const generateRefreshToken = (payload: { uuid: string }) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};
