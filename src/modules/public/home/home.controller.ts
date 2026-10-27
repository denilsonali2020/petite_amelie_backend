import type { Request, Response } from "express";
import { homeService } from "./home.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";
import { responseError } from "../../../shared/errors/ResponseError.js";

export class HomeController {
  static navigation = async (req: Request, res: Response) => {
    try {
      const navigation = await homeService.navigation();
      return res.status(200).json(navigation);
    } catch (error) {
      return responseError(res, error);
    }
  };

  static latestProducts = async (req: Request, res: Response) => {
    try {
      const new_arrivals = await homeService.latestProducts();
      return res.status(200).json(formatResponse(new_arrivals));
    } catch (error) {
      return responseError(res, error);
    }
  };

  static getLatestSubcategories = async (req: Request, res: Response) => {
    try {
      const latestSubCategories = await homeService.getLatestSubcategories();
      return res.status(200).json(latestSubCategories);
    } catch (error) {
      return responseError(res, error);
    }
  };

  static getBestSellersPerTopCategories = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const getBestSellersPerTopCategories =
        await homeService.getBestSellersPerTopCategories();
      return res
        .status(200)
        .json(formatResponse(getBestSellersPerTopCategories));
    } catch (error) {
      return responseError(res, error);
    }
  };

  static getOffersPerTopCategories = async (req: Request, res: Response) => {
    try {
      const categoryProductsOffers =
        await homeService.getOffersPerTopCategories();
      return res.status(200).json(formatResponse(categoryProductsOffers));
    } catch (error) {
      return responseError(res, error);
    }
  };
}
