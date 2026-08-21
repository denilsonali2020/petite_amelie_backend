import { Router } from "express";
import { param, query } from "express-validator";
import { StoreCategoryController } from "./storeCategory.controller.js";
import { handleInputErrors } from "../../../middleware/validation.js";

const router = Router();

// StoreCategory routes
router.get(
  "/:categoryId",
  param("categoryId").isUUID().withMessage("Categoria no valida"),
  query("page")
    .isInt({ min: 1 })
    .toInt()
    .withMessage("La página debe ser un número entero mayor a 0"),
  query("limit")
    .isInt({ min: 10, max: 100 })
    .toInt()
    .withMessage("El límite debe ser un número entre 1 y 100"),
  handleInputErrors,
  StoreCategoryController.productsByCategory,
);

export default router;
