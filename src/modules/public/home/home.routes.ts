import { Router } from "express";
import { HomeController } from "./home.controller.js";

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

export default router;
