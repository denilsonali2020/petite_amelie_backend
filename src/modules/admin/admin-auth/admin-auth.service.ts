import { prisma } from "../../../config/db.js";
import { HttpError } from "../../../shared/errors/HttpError.js";
import { checkPassword, hashPassword } from "../../../shared/utils/auth.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../shared/utils/jwt.js";
import jwt from "jsonwebtoken";
import { AdminLoginForm, mustChangePassword } from "./admin-auth.types.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { user } from "../user/user.types.js";

export const adminAuthService = {
  async login({ email, password }: AdminLoginForm) {
    // 1. Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError("Usuario no encontrado", 404);

    // 2. Verificar si está activo (importante para empleados dados de baja)
    if (!user.isActive) {
      throw new HttpError("Cuenta inactiva. Contacta al administrador", 409);
    }
    // 3. Revisar password
    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect)
      throw new HttpError("Credenciales incorrectas", 409);

    // 4. Generar tokens
    const accessToken = generateAccessToken({ uuid: user.uuid });
    const refreshToken = generateRefreshToken({ uuid: user.uuid });

    // 5. Guardar Refresh Token en la BD
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      userData: {
        uuid: user.uuid,
        name: user.name,
        role: user.role,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
      },
    };
  },

  async refreshToken(currentToken: string) {
    // 1. Buscar usuario con ese token
    const user = await prisma.user.findFirst({
      where: { refreshToken: currentToken },
    });
    if (!user || !user.isActive) throw new HttpError("Acceso denegado", 403);

    try {
      // 2. Verificar validez del token
      const decoded = jwt.verify(
        currentToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { uuid: string };

      if (user.uuid !== decoded.uuid)
        throw new HttpError("Acceso denegado", 403);

      // 3. Generar nuevo Access Token
      const accessToken = generateAccessToken({ uuid: decoded.uuid });
      return accessToken;
    } catch (error) {
      throw new HttpError("Token expirado o inválido", 403);
    }
  },

  async logout(currentToken: string) {
    // Buscar y eliminar el refresh token de la BD
    const user = await prisma.user.findFirst({
      where: { refreshToken: currentToken },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
    }
  },

  async mustChangePassword(uuid: user["uuid"], data: mustChangePassword) {
    try {
      const hashPasswordValue = await hashPassword(data.password);
      await prisma.user.update({
        where: { uuid },
        data: {
          password: hashPasswordValue,
          mustChangePassword: false,
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      if (error.code === "P2025")
        throw new HttpError("Usuario no encontrado", 404);

      throw error;
    }
  },
};
