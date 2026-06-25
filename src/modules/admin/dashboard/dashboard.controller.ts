import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service.js";

export class DashboardController {
  static getCurrentYearMonthlySales = async (req: Request, res: Response) => {
    try {
      const sales = await dashboardService.getCurrentYearMonthlySales();
      return res.status(200).json(sales);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getRecentOrders = async (req: Request, res: Response) => {
    try {
      const recentOrders = await dashboardService.getRecentOrders();
      return res.status(200).json(recentOrders);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getTopSellingSubcategories = async (req: Request, res: Response) => {
    try {
      const topCategories = await dashboardService.getTopSellingSubcategories();
      return res.status(200).json(topCategories);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getTopSellingProducts = async (req: Request, res: Response) => {
    try {
      const topProducts = await dashboardService.getTopSellingProducts();
      return res.status(200).json(topProducts);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
