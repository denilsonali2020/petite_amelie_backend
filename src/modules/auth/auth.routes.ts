// import { Router } from "express";
// import { body, param } from "express-validator";
// import { AuthController } from "./auth.controller.js";
// import { handleInputErrors } from "../../middleware/validation.js";
// import { authenticate } from "../../middleware/auth.js";

// const router = Router();

// /** Routes for Auth without validation */
// //crear una cuenta
// router.post(
//   "/create-account",
//   body("username")
//     .isLength({ min: 3 })
//     .withMessage("Nombre de usuario muy corto")
//     .notEmpty()
//     .withMessage("El nombre no puede ir vacio"),
//   body("email").isEmail().withMessage("Email no válido"),
//   body("password")
//     .isLength({ min: 10 })
//     .withMessage("Password muy corto minimo 10 caracteres"),
//   body("password_confirmation").custom((value, { req }) => {
//     if (value !== req.body.password) {
//       throw new Error("Los password no son iguales");
//     }
//     return true;
//   }),
//   handleInputErrors,
//   AuthController.createAcount,
// );
// //confirmar cuenta
// router.post(
//   "/confirm-account",
//   body("token").notEmpty().withMessage("El token no puede ir vacio"),
//   handleInputErrors,
//   AuthController.confirmAccount,
// );
// //loggin al usuario
// router.post(
//   "/login",
//   body("email").isEmail().withMessage("Email no válido"),
//   body("password").notEmpty().withMessage("El password no puede ir vacio"),
//   handleInputErrors,
//   AuthController.login,
// );
// //nuevo codigo para confirmar cuenta
// router.post(
//   "/request-code",
//   body("email").isEmail().withMessage("Email no válido"),
//   handleInputErrors,
//   AuthController.reqConfirmationToken,
// );
// //olvide contraseña
// router.post(
//   "/forgot-password",
//   body("email").isEmail().withMessage("Email no válido"),
//   handleInputErrors,
//   AuthController.forgotPassword,
// );
// //validar token de olvide contraseña
// router.post(
//   "/validate-token",
//   body("token").notEmpty().withMessage("Token no valido"),
//   handleInputErrors,
//   AuthController.validateToken,
// );
// //actualizar la contraseña
// router.put(
//   "/update-password/:token",
//   param("token").isNumeric().withMessage("Token no válido"),
//   body("password")
//     .isLength({ min: 10 })
//     .withMessage("El password es muy corto minimo 8 caracteres"),
//   body("password_confirmation").custom((value, { req }) => {
//     if (value !== req.body.password) {
//       throw new Error("Los password no son iguales");
//     }
//     return true;
//   }),
//   handleInputErrors,
//   AuthController.updatePassword,
// );

// /** Routes for auth with validation */
// //devuelve la informacion del usuario en un TOKEN
// router.get("/user", authenticate, AuthController.user);
// export default router;
