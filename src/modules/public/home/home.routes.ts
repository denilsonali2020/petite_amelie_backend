import { Router } from "express";
import { HomeController } from "./home.controller.js";

const router = Router();

// Home routes
//list of categories for navigation
router.get("/navigation", HomeController.navigation);

// new arrivals products in the stock
router.get("/latest-products", HomeController.latestProducts);

// new sub-categories
router.get("/sub-categories/latest", HomeController.getLatestSubcategories)

export default router;
