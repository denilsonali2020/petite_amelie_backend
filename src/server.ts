import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import categoryRoutes from "./modules/admin/category/category.routes.js";
import productRoutes from "./modules/admin/product/product.routes.js";
import userRoutes from "./modules/admin/user/user.routes.js";
import authAdminRoutes from "./modules/admin/admin-auth/admin-auth.routes.js";
import orderRoutes from "./modules/admin/order/order.routes.js";
import billingConfigRoutes from "./modules/admin/settings/billingConfig/billingConfig.routes.js";
import customerRoutes from "./modules/admin/customer/customer.routes.js";
import dashBoardRoutes from "./modules/admin/dashboard/dashboard.routes.js";
import reportRoutes from "./modules/admin/report/reports.routes.js";

import homeRoutes from "./modules/public/home/home.routes.js";

// import authRoutes from "../src/modules/auth/auth.routes.js"; //rutas de cliente pendiente
import { corsConfig } from "./config/cors.js";

//Instancia de express
const app = express();

//Configuracion de CORS
app.use(cors(corsConfig));

//Poder enviar json como respuesta
app.use(express.json());

//Poder enviar cookies
app.use(cookieParser());

//Routes Administrative
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin-auth", authAdminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/billing-config", billingConfigRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/dashboard", dashBoardRoutes);
app.use("/api/reports", reportRoutes);

//Routes Public Store
app.use("/api/home", homeRoutes)

// app.use("/api/auth", authRoutes); //rutas de cliente pendiente

export default app;
