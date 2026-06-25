import type { Request, Response } from "express";
import { orderService } from "./order.service.js";
import { Order } from "../../../generated/prisma/client.js";

export class OrderController {
  static createOrder = async (req: Request, res: Response) => {
    try {
      const result = await orderService.createOrder(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getOrders = async (req: Request, res: Response) => {
    try {
      let page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      if (page < 1) {
        page = 1;
      }
      const paginatedOrders = await orderService.getOrders(page, limit);
      return res.status(200).json(paginatedOrders);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getOrder = async (
    req: Request<{ uuid: Order["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      const order = await orderService.getOrder(uuid);

      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static addShippingInfo = async (
    req: Request<{ uuid: Order["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      await orderService.addShippingInfo(uuid, req.body);

      return res.status(200).send("Informacion agregada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static changeStatus = async (
    req: Request<{ uuid: Order["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      await orderService.changeStatus(uuid, req.body);

      return res.status(200).send("Estado cambiado!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
