import type { Request, Response } from "express";
import { customerService } from "./customer.service.js";

export class CustomerController {
  static getCustomerBilingInfo = async (
    req: Request<{ identifier: string }>,
    res: Response,
  ) => {
    try {
      const { identifier } = req.params;
      const customer = await customerService.getCustomerBilingInfo(identifier);
      return res.status(200).json(customer);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
