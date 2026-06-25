import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../../../../middleware/validation.js";
import { authenticate } from "../../../../middleware/admin-auth.js";
import { BillingConfigController } from "./billingConfig.controller.js";
import { SALE_CHANNELS } from "./billingConfig.types.js";
import { authorizeRoles, ROLES } from "../../../../middleware/roles.js";

const router = Router();

// Crear un nuevo talonario/configuración
router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  body("channel")
    .isIn(SALE_CHANNELS)
    .withMessage(`El canal debe ser: ${SALE_CHANNELS.join(", ")}`),
  body("cai").notEmpty().withMessage("El CAI es requerido"),
  body("rangeFrom").notEmpty().withMessage("El rango de inicio es requerido"),
  body("rangeTo").notEmpty().withMessage("El rango final es requerido"),
  body("limitDate")
    .isISO8601()
    .withMessage("La fecha límite debe ser una fecha válida"),
  body("prefix").notEmpty().withMessage("El prefijo es requerido"),
  body("currentSequence")
    .isInt({ min: 1 })
    .withMessage("La secuencia actual debe ser un número mayor a 0")
    .toInt(),
  body("isActive").isBoolean().withMessage("Estado no validó").toBoolean(),
  handleInputErrors,
  BillingConfigController.createBillingConfig,
);

// Obtener la configuración activa por canal (POS o WEB)
router.get(
  "/active/:channel",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  param("channel")
    .isIn(SALE_CHANNELS)
    .withMessage(`El canal debe ser: ${SALE_CHANNELS.join(", ")}`),
  handleInputErrors,
  BillingConfigController.getActiveConfig,
);

// Obtener una configuración específica por ID
router.get(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  param("uuid").isUUID().withMessage("Configuracion no válida"),
  handleInputErrors,
  BillingConfigController.getBillingConfig,
);

// Obtener todo el historial de configuraciones
router.get(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  BillingConfigController.getAllBillingConfigs,
);

// Actualizar una configuración (ej. para desactivarla manualmente o corregir un typo)
router.put(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  param("uuid").isUUID().withMessage("Configuración no válida"),
  body("channel")
    .isIn(SALE_CHANNELS)
    .withMessage(`El canal debe ser: ${SALE_CHANNELS.join(", ")}`),
  body("cai").notEmpty().withMessage("El CAI es requerido"),
  body("rangeFrom").notEmpty().withMessage("El rango de inicio es requerido"),
  body("rangeTo").notEmpty().withMessage("El rango final es requerido"),
  body("limitDate")
    .isISO8601()
    .withMessage("La fecha límite debe ser una fecha válida"),
  body("prefix").notEmpty().withMessage("El prefijo es requerido"),
  body("currentSequence")
    .isInt({ min: 1 })
    .withMessage("La secuencia actual debe ser un número mayor a 0")
    .toInt(),
  body("isActive").isBoolean().withMessage("Estado no validó").toBoolean(),
  handleInputErrors,
  BillingConfigController.updateBillingConfig,
);

export default router;
