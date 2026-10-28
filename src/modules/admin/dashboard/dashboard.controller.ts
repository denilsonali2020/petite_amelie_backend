import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service.js";

export class DashboardController {
  static getCurrentYearMonthlySales = async (req: Request, res: Response) => {
    const sales = await dashboardService.getCurrentYearMonthlySales();
    return res.status(200).json(sales);
  };

  static getRecentOrders = async (req: Request, res: Response) => {
    const recentOrders = await dashboardService.getRecentOrders();
    return res.status(200).json(recentOrders);
  };

  static getTopSellingSubcategories = async (req: Request, res: Response) => {
    const topCategories = await dashboardService.getTopSellingSubcategories();
    return res.status(200).json(topCategories);
  };

  static getTopSellingProducts = async (req: Request, res: Response) => {
    const topProducts = await dashboardService.getTopSellingProducts();
    return res.status(200).json(topProducts);
  };
}
