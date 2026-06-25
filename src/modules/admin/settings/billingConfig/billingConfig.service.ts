import { prisma } from "../../../../config/db.js";
import {
  BillingConfig,
  Prisma,
  SaleChannel,
} from "../../../../generated/prisma/client.js";
import { HttpError } from "../../../../shared/errors/HttpError.js";
import {
  billingConfig,
  createBillingConfig,
  updateBillingConfig,
} from "./billingConfig.types.js";

export const billingConfigService = {
  async createBillingConfig(data: createBillingConfig) {
    try {
      // Si el nuevo talonario viene como activo, desactivamos los anteriores de ese mismo canal
      if (data.isActive !== false) {
        await prisma.billingConfig.updateMany({
          where: { channel: data.channel, isActive: true },
          data: { isActive: false },
        });
      }

      // Convertimos la fecha de string a objeto Date para Prisma
      const newConfig = await prisma.billingConfig.create({
        data: {
          ...data,
          limitDate: new Date(data.limitDate),
        },
      });
      return newConfig;
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

  async getActiveConfig(channel: SaleChannel) {
    const config = await prisma.billingConfig.findFirst({
      where: { channel, isActive: true },
    });
    if (!config) {
      throw new HttpError(
        `No hay configuración de facturación activa para el canal ${channel}`,
        404,
      );
    }
    return config;
  },

  async getBillingConfig(uuid: billingConfig["uuid"]) {
    const config = await prisma.billingConfig.findUnique({
      where: { uuid },
      select: {
        channel: true,
        cai: true,
        rangeFrom: true,
        rangeTo: true,
        limitDate: true,
        prefix: true,
        currentSequence: true,
        isActive: true,
      },
    });
    if (!config) {
      throw new HttpError("Configuración de facturación no encontrada", 404);
    }
    return config;
  },

  async getAllBillingConfigs() {
    return await prisma.billingConfig.findMany({
      orderBy: { id: "desc" },
      select: {
        uuid: true,
        channel: true,
        cai: true,
        rangeFrom: true,
        rangeTo: true,
        limitDate: true,
        prefix: true,
        currentSequence: true,
        isActive: true,
      },
    });
  },

  async updateBillingConfig(
    uuid: billingConfig["uuid"],
    data: updateBillingConfig,
  ) {
    try {
      // Si estamos activando este, apagamos los demás del mismo canal
      if (data.isActive) {
        const current = await prisma.billingConfig.findUnique({
          where: { uuid },
        });
        if (current) {
          await prisma.billingConfig.updateMany({
            where: {
              channel: current.channel,
              isActive: true,
              uuid: { not: uuid },
            },
            data: { isActive: false },
          });
        }
      }

      await prisma.billingConfig.update({
        where: { uuid },
        data: {
          ...data,
          limitDate: data.limitDate ? new Date(data.limitDate) : undefined,
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
        throw new HttpError("Configuración no encontrada", 404);

      throw error;
    }
  },
};
