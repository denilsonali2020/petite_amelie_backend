import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation.js";
import { AdminAuthController } from "./admin-auth.controller.js";
import { authenticate } from "../../../middleware/admin-auth.js"; // Ajusta la ruta a tu middleware

const router = Router();

router.post(
  "/login",
  body("email").isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  handleInputErrors,
  AdminAuthController.login,
);

router.get("/refresh", AdminAuthController.refreshToken);

router.post("/logout", AdminAuthController.logout);

// Ruta protegida para obtener los datos del empleado logueado al recargar la app
router.get("/me", authenticate, AdminAuthController.me);

//cambiar la contraseña por primer inicio de sesión
router.put(
  "/:uuid/password",
  authenticate,
  param("uuid").isUUID().withMessage("Usuario no valido"),
  body("password")
    .isLength({ min: 10 })
    .withMessage("La nueva contraseña debe tener al menos 10 caracteres"),
  handleInputErrors,
  AdminAuthController.mustChangePassword,
);

export default router;
