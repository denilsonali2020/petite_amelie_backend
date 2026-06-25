import { Router } from "express";
import { param } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation.js";
import { CustomerController } from "./customer.controller.js";
import { authenticate } from "../../../middleware/admin-auth.js";
import { authorizeRoles, ROLES } from "../../../middleware/roles.js";

const router = Router({ mergeParams: true });

// Customer routes
//obtener un customer por su numero de telefono o email
router.post(
  "/:identifier",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  param("identifier").notEmpty().withMessage("El identificador es requerido"),
  handleInputErrors,
  CustomerController.getCustomerBilingInfo,
);

export default router;
