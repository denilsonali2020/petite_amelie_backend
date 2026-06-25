import type { Request, Response } from "express";
import { reportService } from "./reports.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";

export class ReportController {
  static getMetricsFinance = async (req: Request, res: Response) => {
    try {
      const { from, to } = req.query as { from: string; to: string };
      const metrics = await reportService.getMetricsFinance(from, to);
      return res.status(200).json(metrics);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getMetricsEmployees = async (req: Request, res: Response) => {
    try {
      const { from, to } = req.query as { from: string; to: string };
      const metrics = await reportService.getMetricsEmployees(from, to);
      return res.status(200).json(metrics);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getMetricsInventory = async (req: Request, res: Response) => {
    try {
      const metrics = await reportService.getMetricsInventory();
      return res.status(200).json(formatResponse(metrics));
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
