import type { Request, Response } from "express";
import {
  BillingConfig,
  SaleChannel,
} from "../../../../generated/prisma/client.js";
import { billingConfigService } from "./billingConfig.service.js";
import { billingConfig } from "./billingConfig.types.js";

export class BillingConfigController {
  static createBillingConfig = async (req: Request, res: Response) => {
    await billingConfigService.createBillingConfig(req.body);
    return res.status(201).send("Configuración de facturación creada!");
  };

  static getActiveConfig = async (
    req: Request<{ channel: BillingConfig["channel"] }>,
    res: Response,
  ) => {
    const channel = req.params.channel.toUpperCase() as SaleChannel;
    const config = await billingConfigService.getActiveConfig(channel);
    return res.status(200).json(config);
  };

  static getBillingConfig = async (
    req: Request<{ uuid: billingConfig["uuid"] }>,
    res: Response,
  ) => {
    const { uuid } = req.params;
    const config = await billingConfigService.getBillingConfig(uuid);
    return res.status(200).json(config);
  };

  static getAllBillingConfigs = async (req: Request, res: Response) => {
    const configs = await billingConfigService.getAllBillingConfigs();
    return res.status(200).json(configs);
  };

  static updateBillingConfig = async (
    req: Request<{ uuid: BillingConfig["uuid"] }>,
    res: Response,
  ) => {
    const { uuid } = req.params;
    await billingConfigService.updateBillingConfig(uuid, req.body);
    return res.status(200).send("Configuración actualizada!");
  };
}
