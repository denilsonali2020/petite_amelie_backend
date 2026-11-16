import { Router } from "express";
import { HomeController } from "./home.controller.js";
import { query } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation.js";

const router = Router();

// Home routes
//list of categories for navigation
router.get("/navigation", HomeController.navigation);

// new arrivals products in the stock
router.get("/latest-products", HomeController.latestProducts);

// new sub-categories
router.get("/sub-categories/latest", HomeController.getLatestSubcategories);

// best-sellers top 5 categories with more sales and 10 products bestsellesrs
router.get(
  "/best-sellers/latest",
  HomeController.getBestSellersPerTopCategories,
);

// search for a product by name
router.get(
  "/search",
  query("p")
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Ingrese una cadena de texto con al menos 2 caracteres"),
  handleInputErrors,
  HomeController.searchProduct,
);

// offers return all categories with all products in offer
router.get("/offers/latest", HomeController.getOffersPerTopCategories);

export default router;
