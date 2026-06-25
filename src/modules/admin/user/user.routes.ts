import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../../../middleware/validation.js";
import { userController } from "./user.controller.js";
import { USER_ROLES } from "./user.types.js";
import {
  authenticate,
  checkIdentityMatch,
} from "../../../middleware/admin-auth.js";
import { authorizeRoles, ROLES } from "../../../middleware/roles.js";

const router = Router();

// User routes
// Crear un nuevo usuario
router.post(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  body("name").notEmpty().withMessage("El nombre del usuario es requerido"),
  body("email").isEmail().withMessage("El email no es válido"),
  body("password")
    .isLength({ min: 10 })
    .withMessage("La contraseña debe tener al menos 10 caracteres"),
  body("role")
    .isIn(USER_ROLES)
    .withMessage(`El rol debe ser: ${USER_ROLES.join(", ")}`),
  handleInputErrors,
  userController.createUser,
);

//usuarios para modulo de ventas al momento de decidir quien vende
router.get(
  "/quick-pin",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  userController.getUsersQuickPin,
);

//obtener un usuario
router.get(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  param("uuid").isUUID().withMessage("Usuario no valido"),
  handleInputErrors,
  userController.getUser,
);

//obtener todos los usuarios
router.get(
  "/",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  userController.getAllUsers,
);

//actualizar datos de un usuario
router.put(
  "/:uuid",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  param("uuid").isUUID().withMessage("Usuario no valido"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre del usuario es requerido"),
  body("email").optional().isEmail().withMessage("El email no es válido"),
  body("role")
    .optional()
    .isIn(USER_ROLES)
    .withMessage(`El rol debe ser: ${USER_ROLES.join(", ")}`),
  handleInputErrors,
  userController.updateUser,
);

//validar contraseña
router.post(
  "/:uuid/check-password",
  authenticate,
  authorizeRoles(ROLES.OWNER, ROLES.ADMIN, ROLES.CASHIER),
  param("uuid").isUUID().withMessage("Usuario no valido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  handleInputErrors,
  userController.verifyPassword,
);

// Owner Recuperar la contraseña de un usuario si la olvido
router.patch(
  "/:uuid/recovery",
  authenticate,
  authorizeRoles(ROLES.OWNER),
  param("uuid").isUUID().withMessage("Usuario no valido"),
  body("password")
    .isLength({ min: 10 })
    .withMessage("La contraseña debe tener al menos 10 caracteres"),
  handleInputErrors,
  userController.recoveryPasswordUser,
);

//Editar nombre de usuario en sesion
router.patch(
  "/:uuid/name",
  authenticate,
  checkIdentityMatch,
  param("uuid").isUUID().withMessage("Usuario no valido"),
  body("name").notEmpty().withMessage("El nombre del usuario es requerido"),
  handleInputErrors,
  userController.updateName,
);

//cambiar contraseña de usuario en sesion
router.patch(
  "/:uuid/change-password",
  authenticate,
  checkIdentityMatch,
  param("uuid").isUUID().withMessage("Usuario no valido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  body("newPassword")
    .isLength({ min: 10 })
    .withMessage("La contraseña debe tener al menos 10 caracteres"),
  handleInputErrors,
  userController.changePassword,
);

//cambiar quickPin del usuario
router.patch(
  "/:uuid/change-quickpin",
  authenticate,
  checkIdentityMatch,
  param("uuid").isUUID().withMessage("Usuario no valido"),
  body("quickPin")
    .notEmpty()
    .withMessage("El pin no puede ir vacio")
    .isLength({ min: 4, max: 4 })
    .withMessage("El pin debe ser de 4 digitos"),
  handleInputErrors,
  userController.changeQuickPin,
);

export default router;
