import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { IUser } from "../modules/admin/admin-auth/admin-auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error("No Autorizado");
    return res.status(401).json({ msg: error.message });
  }

  const token = bearer.split(" ")[1];

  try {
    // CAMBIO 1: Ahora usamos JWT_ACCESS_SECRET porque el frontend envía el token de 15 minutos
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);

    // Comprobación por parte de Ts
    if (typeof decoded === "object" && decoded.uuid) {
      // CAMBIO 2: Traemos 'role' e 'isActive' (y cambiamos username por name según tu schema)
      const user = await prisma.user.findUnique({
        where: { uuid: decoded.uuid },
        select: {
          id: true,
          uuid: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          mustChangePassword: true,
        },
      });

      if (user) {
        // CAMBIO 3: Validar que el empleado siga activo en la empresa
        if (!user.isActive) {
          return res
            .status(403)
            .json({ error: "Usuario inactivo o suspendido" });
        }

        req.user = user as IUser;
        next();
      } else {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }
    }
  } catch (error: any) {
    // CAMBIO 4: Identificar si el error es porque el token caducó
    if (error.name === "TokenExpiredError") {
      // El frontend necesita este 401 exacto para saber cuándo pedir el Refresh Token
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(401).json({ error: "Token no Válido" });
  }
};

// Middleware para validar que el usuario autenticado es el mismo que el que se intenta modificar
export const checkIdentityMatch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { uuid } = req.params;

  if (req.user?.uuid !== uuid) {
    return res.status(409).json({ error: "Acceso no permitido" });
  }

  next();
};


