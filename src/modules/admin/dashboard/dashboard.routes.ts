import { Router } from "express";
import { handleInputErrors } from "../../../middleware/validation.js";
import { DashboardController } from "./dashboard.controller.js";
import { authenticate } from "../../../middleware/admin-auth.js";
import { authorizeRoles, ROLES } from "../../../middleware/roles.js";

const router = Router();

// Dashboard routes
//obtener las ventas por mes del año presente
router.get(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  DashboardController.getCurrentYearMonthlySales,
);

//obtener los ultimos 10 pedidos relizados
router.get(
  "/recent",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  DashboardController.getRecentOrders,
);

//obtener las sub-categorias mas rentables
router.get(
  "/top-categories",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  DashboardController.getTopSellingSubcategories,
);

//obtener los productos mas vendidos
router.get(
  "/top-products",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  DashboardController.getTopSellingProducts,
);

export default router;
