import { Router } from "express";
import { query } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation.js";
import { ReportController } from "./report.controller.js";
import { authenticate } from "../../../middleware/admin-auth.js";
import { authorizeRoles, ROLES } from "../../../middleware/roles.js";

const router = Router();

// Report routes
// Metricas de reportes

// Reporte de Finanzas y ventas
router.get(
  "/finance",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  [
    query("from")
      .notEmpty()
      .withMessage("La fecha de inicio (from) es obligatoria")
      .isISO8601()
      .withMessage(
        "La fecha de inicio debe tener un formato válido (YYYY-MM-DD)",
      ),

    query("to")
      .notEmpty()
      .withMessage("La fecha de fin (to) es obligatoria")
      .isISO8601()
      .withMessage("La fecha de fin debe tener un formato válido (YYYY-MM-DD)"),
  ],
  handleInputErrors,
  ReportController.getMetricsFinance,
);

// Reporte de rendimiento de empleados en ventas
router.get("/employees", authenticate, authorizeRoles(ROLES.OWNER), [
  query("from")
    .notEmpty()
    .withMessage("La fecha de inicio (from es obligatoria)")
    .isISO8601()
    .withMessage("La fecha de inicio debe tener formato válido (YYYY-MM-DD)"),
  query("to")
    .notEmpty()
    .withMessage("La fecha de fin (to) es obligatoria")
    .isISO8601()
    .withMessage("La fecha de fin debe tener un formato válido (YYYY-MM-DD)"),
  handleInputErrors,
  ReportController.getMetricsEmployees,
]);

// Reporte de productos mas vendidos, lowstock, etc
router.get(
  "/inventory",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  ReportController.getMetricsInventory,
);

export default router;
