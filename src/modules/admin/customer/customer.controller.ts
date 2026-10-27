import type { Request, Response } from "express";
import { customerService } from "./customer.service.js";
import { responseError } from "../../../shared/errors/ResponseError.js";

export class CustomerController {
  static getCustomerBilingInfo = async (
    req: Request<{ identifier: string }>,
    res: Response,
  ) => {
    try {
      const { identifier } = req.params;
      const customer = await customerService.getCustomerBilingInfo(identifier);
      return res.status(200).json(customer);
    } catch (error) {
      return responseError(res, error);
    }
  };
}
