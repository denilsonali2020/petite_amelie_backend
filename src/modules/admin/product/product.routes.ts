import { Router } from "express";
import { body, param, query } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation.js";
import { upload } from "../../../middleware/upload.js";
import { ProductController } from "./product.controller.js";
import { authenticate } from "../../../middleware/admin-auth.js";
import { authorizeRoles, ROLES } from "../../../middleware/roles.js";

const router = Router();

// Product Routes
// =========================
// RUTAS ESTÁTICAS
// =========================
// Buscador de productos mediante nombre o sku
router.get(
  "/search",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  query("p")
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Ingrese una cadena de texto con al menos 2 caracteres"),
  handleInputErrors,
  ProductController.searchProduct,
);

// =========================
// RUTAS DINAMICAS LARGAS
// =========================

//cambiarImagen de un producto
router.put(
  "/:productId/product/:imageId/image",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  upload.single("image"),
  param("productId").isUUID().withMessage("Producto no válidó"),
  param("imageId").isUUID().withMessage("Imagen no válidá"),
  handleInputErrors,
  ProductController.updateProductImage,
);

//obtener productos de una categoria por uuid
router.get(
  "/:categoryId/products",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  param("categoryId").isUUID().withMessage("Categoria no válidá"),
  query("page")
    .isInt({ min: 1 })
    .toInt()
    .withMessage("La página debe ser un número entero mayor a 0"),
  query("limit")
    .isInt({ min: 10, max: 100 })
    .toInt()
    .withMessage("El límite debe ser un número entre 1 y 100"),
  handleInputErrors,
  ProductController.getProductsByCategory,
);

//subir una imagen de un producto
router.post(
  "/:productId/image",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  upload.single("image"),
  param("productId").isUUID().withMessage("Producto no válidó"),
  handleInputErrors,
  ProductController.createProductImage,
);

//eliminar una imagen
router.delete(
  "/:imageId/image",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  param("imageId").isUUID().withMessage("Imagen no válida"),
  handleInputErrors,
  ProductController.deleteProductImage,
);

//buscar un producto por sku para nueva orden
router.post(
  "/:sku/order",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  param("sku").isString().withMessage("Sku no válido"),
  ProductController.getProductOrder,
);

// =========================
// RUTAS DINÁMICAS CORTAS
// =========================
//crear un producto
router.post(
  "/:categoryId",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  upload.array("image", 5),
  param("categoryId").isUUID().withMessage("Categoria no válidá"),
  body("name")
    .notEmpty()
    .withMessage("El nombre del producto no puede ir vacio"),
  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("La descripción del producto debe ser un texto"),
  body("sku").notEmpty().withMessage("El SKU es obligatorio"),
  body("cost")
    .isNumeric()
    .withMessage("El costo del producto debe ser un número")
    .toFloat(),
  body("price")
    .isNumeric()
    .withMessage("El precio del producto debe ser un número")
    .toFloat(),
  body("isReward").isBoolean().withMessage("Formato no validó").toBoolean(),
  body("pointsValue")
    .isInt({ min: 0 })
    .withMessage("Los puntos deben ser mayor o igual a 0")
    .toInt(),
  body("minStock")
    .isInt({ min: 0 })
    .withMessage("El stock mínimo debe ser un número entero igual o mayor a 0")
    .toInt(),
  body("stock")
    .isInt({ min: 0 })
    .withMessage(
      "El stock del producto debe ser un número entero igual o mayor a 0",
    )
    .toInt(),
  handleInputErrors,
  ProductController.createProduct,
);

//obtener un producto por uuid
router.get(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  param("uuid").isUUID().withMessage("Producto no válidó"),
  handleInputErrors,
  ProductController.getProduct,
);

//actualizar un producto
router.put(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN),
  param("uuid").isUUID().withMessage("Producto no válidó"),
  body("name")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("El nombre del producto debe ser un texto"),
  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("La descripción del producto debe ser un texto"),
  body("sku").notEmpty().withMessage("El SKU es obligatorio"),
  body("price")
    .optional({ checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage("El precio del producto debe ser un número mayor a 0")
    .toFloat(),
  body("isOnDiscount").isBoolean().withMessage("Formato de validó").toBoolean(),
  body("discountPrice")
    .isInt({ min: 0 })
    .withMessage("El precio de descuento debe ser un número mayor o igual a 0")
    .toFloat(),
  body("isReward").isBoolean().withMessage("Formato no validó").toBoolean(),
  body("pointsValue")
    .isInt({ min: 0 })
    .withMessage("Los puntos deben ser mayor o igual a 0")
    .toInt(),
  body("stock")
    .isInt({ min: 0 })
    .withMessage(
      "El stock del producto debe ser un número entero igual o mayor a 0",
    )
    .toInt(),
  body("isActive")
    .isBoolean()
    .withMessage("Formato de estado no validó")
    .toBoolean(),
  handleInputErrors,
  ProductController.updateProduct,
);

//eliminar un producto (desactivarlo)
router.patch(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  param("uuid").isUUID().withMessage("Producto no válidó"),
  handleInputErrors,
  ProductController.isActiveProduct,
);

export default router;
