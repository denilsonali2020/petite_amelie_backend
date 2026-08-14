import { Router } from "express";
import { param } from "express-validator";
import { StoreProductController } from "./storeProduct.controller.js";
import { handleInputErrors } from "../../../middleware/validation.js";

const router = Router();

// StoreProduct routes
router.get(
  "/:uuid",
  param("uuid").isUUID().withMessage("Producto no valido"),
  handleInputErrors,
  StoreProductController.findProduct,
);

export default router;
