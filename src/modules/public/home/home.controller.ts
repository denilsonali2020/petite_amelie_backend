import type { Request, Response } from "express";
import { homeService } from "./home.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";


export class HomeController {
  static navigation = async (req: Request, res: Response) => {
    try {
      const navigation = await homeService.navigation();
      return res.status(200).json(navigation);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static latestProducts = async (req: Request, res: Response) => {
    try {
      const new_arrivals = await homeService.latestProducts();
      return res.status(200).json(formatResponse(new_arrivals));
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getLatestSubcategories = async (req: Request, res: Response) => {
    try {
      const latestSubCategories = await homeService.getLatestSubcategories();
      return res.status(200).json(latestSubCategories);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
