import type { Request, Response } from "express";
import { reportService } from "./reports.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";

export class ReportController {
  static getMetricsFinance = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from: string; to: string };
    const metrics = await reportService.getMetricsFinance(from, to);
    return res.status(200).json(metrics);
  };

  static getMetricsEmployees = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from: string; to: string };
    const metrics = await reportService.getMetricsEmployees(from, to);
    return res.status(200).json(metrics);
  };

  static getMetricsInventory = async (req: Request, res: Response) => {
    const metrics = await reportService.getMetricsInventory();
    return res.status(200).json(formatResponse(metrics));
  };
}
