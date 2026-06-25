// import type { Request, Response } from "express";
// import { authService } from "./auth.service.js";

// export class AuthController {
//   static createAcount = async (req: Request, res: Response) => {
//     try {
//       const { password_confirmation, ...data } = req.body;
//       await authService.createAcount(data);
//       return res.status(201).send("Cuenta creada revisa tu correo!");
//     } catch (error: any) {
//       return res.status(error.status || 500).json({
//         error: error.message,
//       });
//     }
//   };

//   static confirmAccount = async (req: Request, res: Response) => {
//     try {
//       const { token } = req.body;
//       await authService.confirmAccount(token);
//       return res.status(200).send("Cuenta Confirmada inicia sesión!");
//     } catch (error: any) {
//       return res.status(error.status || 500).json({
//         error: error.message,
//       });
//     }
//   };

//   static login = async (req: Request, res: Response) => {
//     try {
//       const { email, password } = req.body;
//       const token = await authService.login({ email, password });
//       return res.status(200).send(token);
//     } catch (error: any) {
//       return res.status(error.status || 500).json({
//         error: error.message,
//       });
//     }
//   };

//   static reqConfirmationToken = async (req: Request, res: Response) => {
//     try {
//       const { email } = req.body;
//       await authService.reqConfirmationToken(email);
//       return res.status(201).send("Se envio un nuevo token, revisa tu e-mail");
//     } catch (error: any) {
//       return res.status(error.status || 500).json({
//         error: error.message,
//       });
//     }
//   };

//   static forgotPassword = async (req: Request, res: Response) => {
//     try {
//       const { email } = req.body;
//       await authService.forgotPassword(email);
//       return res.status(201).send("Revisa tu email y sigue las instrucciones");
//     } catch (error: any) {
//       return res.status(error.status || 500).json({
//         error: error.message,
//       });
//     }
//   };

//   //para cambiar contraseña
//   static validateToken = async (req: Request, res: Response) => {
//     try {
//       const { token } = req.body;
//       await authService.validateToken(token);
//       return res.status(201).send("Token válido, ingresa tu nuevo password");
//     } catch (error: any) {
//       return res.status(error.status || 500).json({
//         error: error.message,
//       });
//     }
//   };

//   static updatePassword = async (req: Request, res: Response) => {
//     try {
//       const token = req.params.token as string;
//       const { password } = req.body;

//       await authService.updatePassword({ token, password });
//       return res.status(201).send("Inisia sesion con tu nuevo password");
//     } catch (error: any) {
//       return res.status(error.status || 500).json({
//         error: error.message,
//       });
//     }
//   };

//   static user = async (req: Request, res: Response) => {
//     try {
//       return res.json(req.user);
//     } catch (error: any) {
//       return res.status(error.status || 500).json({
//         error: error.message,
//       });
//     }
//   };
// }
