import type { Request, Response } from "express";
import { Product } from "../../../generated/prisma/client.js";
import { storeProductService } from "./storeProduct.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";

export class StoreProductController {
  static searchProduct = async (
    req: Request<{ uuid: Product["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      const product = await storeProductService.searchProduct(uuid);
      return res.status(200).json(formatResponse(product));
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
