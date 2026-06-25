import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation.js";
import { upload } from "../../../middleware/upload.js";
import { CategoryController } from "./category.controller.js";
import { authenticate } from "../../../middleware/admin-auth.js";
import { authorizeRoles, ROLES } from "../../../middleware/roles.js";

const router = Router({ mergeParams: true });

// Category routes
//crear una categoria de la compañia
router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  upload.single("image"),
  body("name")
    .notEmpty()
    .withMessage("El nombre de la categoria no puede ir vacio"),
  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("La descripcion debe ser texto")
    .isLength({ min: 50, max: 90 })
    .withMessage("La descripcion debe tener entre 50 y 90 caracteres"),
  body("position").isNumeric().withMessage("Posicion no validá").toInt(),
  body("parentId")
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage("Categoria no valida"),
  handleInputErrors,
  CategoryController.createCategory,
);

//obtener categorias Raiz
router.get(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  CategoryController.getRootCategories,
);

//obtener las subCategorias hijo de la una categoria raiz
router.get(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  param("uuid").isUUID().withMessage("Categoria no valido"),
  handleInputErrors,
  CategoryController.getSubCategoriesByUuid,
);

//obtener una por su id
router.get(
  "/:categoryUuid/category",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  param("categoryUuid").isUUID().withMessage("Categoria no valido"),
  handleInputErrors,
  CategoryController.getCategory,
);

//actualizar RootCategory
router.put(
  "/:categoryUuid/rootCategory",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  param("categoryUuid").isUUID().withMessage("Categoria no valido"),
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("position").isNumeric().withMessage("Posicion no validá").toInt(),
  handleInputErrors,
  CategoryController.updateRootCategory,
);

//actualizar subCategory
router.put(
  "/:rootCategory/rootCategory/:subCategoryId/subCategory",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  upload.single("image"),
  param("rootCategory").isUUID().withMessage("Categoria no valido"),
  param("subCategoryId").isUUID().withMessage("Categoria no valido"),
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("La descripcion debe ser texto")
    .isLength({ min: 50, max: 90 })
    .withMessage("La descripcion debe tener entre 50 y 90 caracteres"),
  body("position").isNumeric().withMessage("Posicion no validá").toInt(),
  handleInputErrors,
  CategoryController.updateSubCategory,
);

//eliminar una categoria padre
router.delete(
  "/:categoryUuid/rootCategory",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  param("categoryUuid").isUUID().withMessage("Categoria no valido"),
  handleInputErrors,
  CategoryController.deleteRootCategory,
);

//eliminar subCategory
router.delete(
  "/:rootCategory/rootCategory/:subCategoryId/subCategory",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  param("rootCategory").isUUID().withMessage("Categoria no valido"),
  param("subCategoryId").isUUID().withMessage("Categoria no valido"),
  handleInputErrors,
  CategoryController.deleteSubCategory,
);
export default router;
