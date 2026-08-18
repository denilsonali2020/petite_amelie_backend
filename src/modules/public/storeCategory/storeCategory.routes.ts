import { Router } from "express";
import { param } from "express-validator";
import { StoreCategoryController } from "./storeCategory.controller.js";
import { handleInputErrors } from "../../../middleware/validation.js";

const router = Router();

// StoreCategory routes
router.get(
  "/:uuid",
  param("uuid").isUUID().withMessage("Categoria no valida"),
  handleInputErrors,
  StoreCategoryController.productsByCategory,
);

export default router;
