import type { Request, Response } from "express";
import { homeService } from "./home.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";

export class HomeController {
  static navigation = async (req: Request, res: Response) => {
    const navigation = await homeService.navigation();
    return res.status(200).json(navigation);
  };

  static latestProducts = async (req: Request, res: Response) => {
    const new_arrivals = await homeService.latestProducts();
    return res.status(200).json(formatResponse(new_arrivals));
  };

  static getLatestSubcategories = async (req: Request, res: Response) => {
    const latestSubCategories = await homeService.getLatestSubcategories();
    return res.status(200).json(latestSubCategories);
  };

  static getBestSellersPerTopCategories = async (
    req: Request,
    res: Response,
  ) => {
    const getBestSellersPerTopCategories =
      await homeService.getBestSellersPerTopCategories();
    return res.status(200).json(formatResponse(getBestSellersPerTopCategories));
  };

  static getOffersPerTopCategories = async (req: Request, res: Response) => {
    const categoryProductsOffers =
      await homeService.getOffersPerTopCategories();
    return res.status(200).json(formatResponse(categoryProductsOffers));
  };
}
