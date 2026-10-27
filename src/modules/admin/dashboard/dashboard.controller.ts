import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service.js";
import { responseError } from "../../../shared/errors/ResponseError.js";

export class DashboardController {
  static getCurrentYearMonthlySales = async (req: Request, res: Response) => {
    try {
      const sales = await dashboardService.getCurrentYearMonthlySales();
      return res.status(200).json(sales);
    } catch (error) {
      return responseError(res, error);
    }
  };

  static getRecentOrders = async (req: Request, res: Response) => {
    try {
      const recentOrders = await dashboardService.getRecentOrders();
      return res.status(200).json(recentOrders);
    } catch (error) {
      return responseError(res, error);
    }
  };

  static getTopSellingSubcategories = async (req: Request, res: Response) => {
    try {
      const topCategories = await dashboardService.getTopSellingSubcategories();
      return res.status(200).json(topCategories);
    } catch (error) {
      return responseError(res, error);
    }
  };

  static getTopSellingProducts = async (req: Request, res: Response) => {
    try {
      const topProducts = await dashboardService.getTopSellingProducts();
      return res.status(200).json(topProducts);
    } catch (error) {
      return responseError(res, error);
    }
  };
}
