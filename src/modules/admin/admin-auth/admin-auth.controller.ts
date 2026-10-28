import type { Request, Response } from "express";
import { adminAuthService } from "./admin-auth.service.js";
import { User } from "../../../generated/prisma/client.js";

// Configuración de la cookie para el refresh token
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días duracion del refresh token
};

export class AdminAuthController {
  static login = async (req: Request, res: Response) => {
    const { accessToken, refreshToken, userData } =
      await adminAuthService.login(req.body);

    res.cookie("jwt", refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({ accessToken, user: userData });
  };

  static refreshToken = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ error: "No autorizado" });

    const accessToken = await adminAuthService.refreshToken(cookies.jwt);
    return res.status(200).json({ accessToken });
  };

  static logout = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    await adminAuthService.logout(cookies.jwt);

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Sesión cerrada" });
  };

  // Este método asume que la ruta usa tu middleware 'authenticate' previo
  static me = async (req: Request, res: Response) => {
    // req.user viene del middleware authenticate
    return res.status(200).json(req.user);
  };

  static mustChangePassword = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    const { uuid } = req.params;
    await adminAuthService.mustChangePassword(uuid, req.body);
    return res.status(200).send("Contraseña actualizada!");
  };
}
