import type { Request, Response } from "express";
import { Category } from "../../../generated/prisma/client.js";
import { storeCategoryService } from "./storeCategory.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";

export class StoreCategoryController {
  static productsByCategory = async (
    req: Request<{ uuid: Category["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      const categoryProducts = await storeCategoryService.productsByCategory(uuid);
      return res.status(200).json(formatResponse(categoryProducts));
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
