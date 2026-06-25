import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation.js";
import { OrderController } from "./order.controller.js";
import { authenticate } from "../../../middleware/admin-auth.js";
import { ORDER_STATUS, PAYMENT_METHOD } from "./order.types.js";
import { authorizeRoles, ROLES } from "../../../middleware/roles.js";

const router = Router();

// Order routes
// Crear una orden desde POS
router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  body("userUUID").isUUID().withMessage("Usuario no valido"),
  body("quickPin")
    .isString()
    .withMessage("Pin no valido")
    .isLength({ min: 4, max: 4 })
    .withMessage("El pin debe ser de 4 digitos"),
  body("billingRTN")
    .optional({ checkFalsy: true })
    .isLength({ min: 14, max: 14 })
    .withMessage("Rtn no valido"),
  body("customerName").optional({ checkFalsy: true }),
  body("customerId")
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage("ID Cliente no valido"),
  body("paymentMethod")
    .isIn(PAYMENT_METHOD)
    .withMessage(`Metodos de pago permitidos: ${PAYMENT_METHOD.join(", ")}`),
  body("items")
    .isArray({ min: 1 })
    .withMessage("La orden debe contener al menos 1 producto"),
  body("items.*.uuid").isUUID().withMessage("ID de producto no válido"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("La cantidad debe ser un numero entero mayor o igual a 1"),
  body("shippingDetails.recipientName")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("El nombre de quien recibe es obligatorio"),

  body("shippingDetails.phone")
    .if(body("shippingDetails.recipientName").notEmpty())
    .notEmpty()
    .withMessage("El teléfono es obligatorio para envíos"),

  body("shippingDetails.country")
    .if(body("shippingDetails.recipientName").notEmpty())
    .notEmpty()
    .withMessage("El país es obligatorio para envíos"),

  body("shippingDetails.department")
    .if(body("shippingDetails.recipientName").notEmpty())
    .notEmpty()
    .withMessage("El departamento/estado es obligatorio para envíos"),

  body("shippingDetails.city")
    .if(body("shippingDetails.recipientName").notEmpty())
    .notEmpty()
    .withMessage("La ciudad es obligatoria para envíos"),

  body("shippingDetails.addressLine1")
    .if(body("shippingDetails.recipientName").notEmpty())
    .notEmpty()
    .withMessage("La dirección exacta es obligatoria para envíos"),

  body("shippingDetails.shippingCost")
    .if(body("shippingDetails.recipientName").notEmpty())
    .isFloat({ min: 0 })
    .withMessage(
      "El costo de envío debe ser un número válido mayor o igual a 0",
    ),

  handleInputErrors,
  OrderController.createOrder,
);

//obtener las orders
router.get(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  OrderController.getOrders,
);

//obtener una orden
router.get(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  OrderController.getOrder,
);

//agregar la informacion de envio a una orden
router.post(
  "/:uuid/shipping",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  OrderController.addShippingInfo,
);

//actualizar el estado de una orden
router.patch(
  "/:uuid/status",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  body("status")
    .isIn(ORDER_STATUS)
    .withMessage(`El estado debe ser: ${ORDER_STATUS.join(", ")}`),
  handleInputErrors,
  OrderController.changeStatus,
);

export default router;
