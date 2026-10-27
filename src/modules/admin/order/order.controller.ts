import type { Request, Response } from "express";
import { orderService } from "./order.service.js";
import { Order } from "../../../generated/prisma/client.js";
import { responseError } from "../../../shared/errors/ResponseError.js";

export class OrderController {
  static createOrder = async (req: Request, res: Response) => {
    try {
      const result = await orderService.createOrder(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return responseError(res, error);
    }
  };

  static getOrders = async (req: Request, res: Response) => {
    try {
      let page = Number(req.query.page);
      const limit = Number(req.query.limit);

      const paginatedOrders = await orderService.getOrders(page, limit);
      return res.status(200).json(paginatedOrders);
    } catch (error) {
      return responseError(res, error);
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
    } catch (error) {
      return responseError(res, error);
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
    } catch (error) {
      return responseError(res, error);
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
    } catch (error) {
      return responseError(res, error);
    }
  };
}
