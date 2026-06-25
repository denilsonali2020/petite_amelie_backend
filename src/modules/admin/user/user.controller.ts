import type { Request, Response } from "express";
import { Category, User } from "../../../generated/prisma/client.js";
import { userService } from "./user.service.js";

export class userController {
  static createUser = async (req: Request, res: Response) => {
    try {
      await userService.createUser(req.body);
      return res.status(201).send("Usuario creado!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getUser = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      const user = await userService.getUser(uuid);
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static updateUser = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      await userService.updateUser(uuid, req.body);
      return res.status(200).send("Usuario actualizado!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static verifyPassword = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      await userService.verifyPassword(uuid, req.body);
      return res.status(200).send("Password correcto!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static recoveryPasswordUser = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      await userService.recoveryPasswordUser(uuid, req.body);
      return res.status(200).send("Solicitud aceptada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static updateName = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      const name = await userService.updateName(uuid, req.body);
      return res.status(200).json(name);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static changePassword = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      await userService.changePassword(uuid, req.body);
      return res.status(200).send("Contraseña actualizada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static changeQuickPin = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      await userService.changeQuickPin(uuid, req.body);
      return res.status(200).send("Pin actualizado!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getUsersQuickPin = async (
    req: Request,
    res: Response,
  ) => {
    try {

      const users = await userService.getUsersQuickPin();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
