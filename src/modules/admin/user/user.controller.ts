import type { Request, Response } from "express";
import { User } from "../../../generated/prisma/client.js";
import { userService } from "./user.service.js";

export class userController {
  static createUser = async (req: Request, res: Response) => {
    await userService.createUser(req.body);
    return res.status(201).send("Usuario creado!");
  };

  static getUser = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    const { uuid } = req.params;
    const user = await userService.getUser(uuid);
    return res.status(200).json(user);
  };

  static getAllUsers = async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    return res.status(200).json(users);
  };

  static updateUser = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    const { uuid } = req.params;
    await userService.updateUser(uuid, req.body);
    return res.status(200).send("Usuario actualizado!");
  };

  static verifyPassword = async (req: Request, res: Response) => {
    const { uuid } = req.user!;

    await userService.verifyPassword(uuid, req.body);
    return res.status(200).send("Password correcto!");
  };

  static recoveryPasswordUser = async (
    req: Request<{ uuid: User["uuid"] }>,
    res: Response,
  ) => {
    const { uuid } = req.params;
    await userService.recoveryPasswordUser(uuid, req.body);
    return res.status(200).send("Solicitud aceptada!");
  };

  static updateName = async (req: Request, res: Response) => {
    const { uuid } = req.user!;
    const name = await userService.updateName(uuid, req.body);
    return res.status(200).json(name);
  };

  static changePassword = async (req: Request, res: Response) => {
    const { uuid } = req.user!;
    await userService.changePassword(uuid, req.body);
    return res.status(200).send("Contraseña actualizada!");
  };

  static changeQuickPin = async (req: Request, res: Response) => {
    const { uuid } = req.user!;
    await userService.changeQuickPin(uuid, req.body);
    return res.status(200).send("Pin actualizado!");
  };

  static getUsersQuickPin = async (req: Request, res: Response) => {
    const users = await userService.getUsersQuickPin();
    return res.status(200).json(users);
  };
}
