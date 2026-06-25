import { prisma } from "../../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";
import { checkPassword, hashPassword } from "../../../shared/utils/auth.js";
import {
  changePassword,
  changeQuickPin,
  createUser,
  recoveryPasswordUser,
  updateName,
  updateUser,
  user,
  verifyPassword,
} from "./user.types.js";

export const userService = {
  async createUser(data: createUser) {
    try {
      data.password = await hashPassword(data.password);
      await prisma.user.create({ data });
    } catch (error: any) {
      if (error.code === "P2002")
        throw new HttpError("El email ya esta en uso", 409);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async getUser(uuid: user["uuid"]) {
    const user = await prisma.user.findUnique({
      where: { uuid },
      select: {
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
    if (!user) {
      throw new HttpError("Usuario no encontrado", 404);
    }
    return user;
  },

  async getAllUsers() {
    const users = await prisma.user.findMany({
      where: {
        role: { not: "OWNER" },
      },
      select: {
        uuid: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    return users;
  },

  async updateUser(uuid: user["uuid"], data: updateUser) {
    try {
      await prisma.user.update({
        where: { uuid },
        data,
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      if (error.code === "P2002")
        throw new HttpError("El email ya esta en uso", 409);
      if (error.code === "P2025")
        throw new HttpError("Usuario no encontrado", 404);

      throw error;
    }
  },

  async verifyPassword(uuid: user["uuid"], data: verifyPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { uuid },
        select: { password: true },
      });

      const isPasswordCorrect = await checkPassword(
        data.password,
        user!.password,
      );

      if (!isPasswordCorrect) throw new HttpError("Contraseña incorrecta", 401);
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

  async recoveryPasswordUser(uuid: user["uuid"], data: recoveryPasswordUser) {
    try {
      const newPassword = await hashPassword(data.password);
      await prisma.user.update({
        where: { uuid },
        data: {
          password: newPassword,
          refreshToken: null,
          mustChangePassword: true,
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

  async updateName(uuid: user["uuid"], data: updateName) {
    try {
      return await prisma.user.update({
        where: { uuid },
        data,
        select: { name: true },
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

  async changePassword(uuid: user["uuid"], data: changePassword) {
    try {
      //Encontrar al usuario
      const userExist = await prisma.user.findUnique({
        where: { uuid },
        select: { password: true },
      });
      if (!userExist) throw new HttpError("El usuario no existe", 404);
      //validar su contraseña
      const isValidPassword = await checkPassword(
        data.password,
        userExist.password,
      );
      if (!isValidPassword)
        throw new HttpError("Credenciales incorrectas", 409);
      //actualizar su contraseña
      await prisma.user.update({
        where: { uuid },
        data: {
          password: await hashPassword(data.newPassword),
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

  async changeQuickPin(uuid: user["uuid"], data: changeQuickPin) {
    try {
      //actualizar quickPin
      await prisma.user.update({
        where: { uuid },
        data: {
          quickPin: await hashPassword(data.quickPin!),
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

  async getUsersQuickPin() {
    try {
      //actualizar quickPin
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
        },
        select: { uuid: true, name: true },
        orderBy: {
          role: "asc"
        }
      });
      return users;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },
};
