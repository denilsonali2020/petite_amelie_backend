import type { Request, Response, NextFunction } from "express";

// Definimos los roles disponibles en el sistema de forma estricta
export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
} as const;

// Extraemos el tipo basado en el objeto ROLES para tener autocompletado
export type Role = keyof typeof ROLES;

/**
 * debe ejecutarse despues del middleware 'authenticate'.
 */
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Verificamos que exista req.user (inyectado previamente por authenticate)
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "No Autorizado!" });
    }

    // 2. Validamos si el rol del usuario actual está en la lista de permitidos
    // Hacemos un cast de req.user.role a 'Role' para que TypeScript no se queje
    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({
        error:
          "Acceso denegado. No tienes los permisos necesarios para esta acción.",
      });
    }
    // 3. Todo correcto, pasa al siguiente middleware o controlador
    next();
  };
};
