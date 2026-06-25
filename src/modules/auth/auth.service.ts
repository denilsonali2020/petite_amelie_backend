// import { prisma } from "../../config/db.js";
// import { AuthEmail } from "../../emails/AuthEmail.js";
// import { Token, User } from "../../generated/prisma/client.js";
// import { HttpError } from "../../shared/errors/HttpError.js";
// import { checkPassword, hashPassword } from "../../shared/utils/auth.js";
// import { generateJWT } from "../../shared/utils/jwt.js";
// import { generateToken } from "../../shared/utils/token.js";
// import {
//   UserCreateForm,
//   UserLoginForm,
//   UserUpdatePasswordForm,
// } from "./auth.types.js";

// export const authService = {
//   async createAcount(data: UserCreateForm) {
//     //validar que el usuario no exista por usuario
//     if (data.username) {
//       const userExist = await prisma.user.findUnique({
//         where: { username: data.username },
//       });
//       if (userExist) {
//         throw new HttpError("Nombre de usuario no disponible", 400);
//       }
//     }

//     //validar que el usuario no exista por email
//     if (data.email) {
//       const userExist = await prisma.user.findUnique({
//         where: { email: data.email },
//       });
//       if (userExist) {
//         throw new HttpError("Email no disponible", 400);
//       }
//     }

//     //hasheamos el password
//     data.password = await hashPassword(data.password);
//     const user = await prisma.user.create({ data });

//     //generamos el token
//     const token = await prisma.token.create({
//       data: {
//         token: generateToken(),
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//         user_id: user.id,
//       },
//     });

//     //Enviamos el email de confirmacion
//     await AuthEmail.sendConfirmationEmail({
//       email: user.email,
//       name: user.username,
//       token: token.token,
//     });
//   },

//   async confirmAccount(token: Token["token"]) {
//     //Validamos que el token exista
//     const tokenExist = await prisma.token.findFirst({ where: { token } });
//     if (!tokenExist) {
//       throw new HttpError("Token no válido", 400);
//     }
//     //validar que el token no haya vencsido
//     const currentTime = new Date();
//     if (currentTime > tokenExist.expiresAt) {
//       throw new HttpError("El token a expirado", 400);
//     }
//     //confirmar la cuenta y eliminar el token
//     await prisma.$transaction([
//       prisma.user.update({
//         where: { id: tokenExist.user_id },
//         data: { confirmed: true },
//       }),
//       prisma.token.delete({
//         where: { id: tokenExist.id },
//       }),
//     ]);
//   },

//   async login({ email, password }: UserLoginForm) {
//     //validar que usuario exista
//     const userExist = await prisma.user.findUnique({ where: { email } });

//     if (!userExist) {
//       throw new HttpError("Usuario no encontrado", 404);
//     }
//     //Si existe pero no esta confirmado
//     if (!userExist.confirmed) {
//       //validar si no esta confirmado, pero si tiene un token?
//       const tokenExist = await prisma.token.findUnique({
//         where: { user_id: userExist.id },
//       });
//       //si tiene un token ya a su nombre lo eliminamos
//       if (tokenExist) {
//         await prisma.token.delete({ where: { id: tokenExist.id } });
//       }

//       //generamos el token
//       const token = await prisma.token.create({
//         data: {
//           token: generateToken(),
//           expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//           user_id: userExist.id,
//         },
//       });

//       //Enviamos el email de confirmacion
//       await AuthEmail.sendConfirmationEmail({
//         email: userExist.email,
//         name: userExist.username,
//         token: token.token,
//       });
//       throw new HttpError(
//         "Cuenta no confirmada, revisa tu email y sigue las instrucciones",
//         409,
//       );
//     } else {
//       //revisamos el password
//       const isPasswordCorrect = await checkPassword(
//         password,
//         userExist.password,
//       );
//       if (!isPasswordCorrect) {
//         throw new HttpError("Credenciales incorrectas", 401);
//       }
//       //Si todo esta bien creamos el JWT
//       const token = generateJWT({ uuid: userExist.uuid });
//       return token;
//     }
//   },

//   async reqConfirmationToken(email: User["email"]) {
//     //validar que usuario exista
//     const userExist = await prisma.user.findUnique({ where: { email } });
//     if (!userExist) {
//       throw new HttpError("Usuario no registrado", 400);
//     } else {
//       //Si ya esta confirmado
//       if (userExist.confirmed) {
//         throw new HttpError("Usuario ya confirmado", 409);
//       }
//       //ver si tenia un token ya creado el usuario
//       const tokenExist = await prisma.token.findUnique({
//         where: { user_id: userExist.id },
//       });
//       //si lo tiene lo eliminamos y agregamos uno nuevo
//       if (tokenExist) {
//         await prisma.token.delete({ where: { id: tokenExist.id } });
//       }
//       //generamos el token
//       const token = await prisma.token.create({
//         data: {
//           token: generateToken(),
//           expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//           user_id: userExist.id,
//         },
//       });
//       //enviamos el email
//       await AuthEmail.sendConfirmationEmail({
//         email: userExist.email,
//         name: userExist.username,
//         token: token.token,
//       });
//     }
//   },

//   async forgotPassword(email: User["email"]) {
//     //validar que usuario exista
//     const userExist = await prisma.user.findUnique({ where: { email } });
//     if (!userExist) {
//       throw new HttpError("Usuario no registrado", 400);
//     } else {
//       if (!userExist.confirmed) {
//         throw new HttpError("Usuario no confirmado", 400);
//       }
//       //ver si tenia un token ya creado el usuario
//       const tokenExist = await prisma.token.findUnique({
//         where: { user_id: userExist.id },
//       });
//       //si lo tiene lo eliminamos y agregamos uno nuevo
//       if (tokenExist) {
//         await prisma.token.delete({ where: { id: tokenExist.id } });
//       }
//       //generamos el token
//       const token = await prisma.token.create({
//         data: {
//           token: generateToken(),
//           expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//           user_id: userExist.id,
//         },
//       });
//       //enviamos el email
//       await AuthEmail.sendPasswordResetToken({
//         email: userExist.email,
//         name: userExist.username,
//         token: token.token,
//       });
//     }
//   },

//   async validateToken(token: Token["token"]) {
//     //validar que usuario exista
//     const tokenExist = await prisma.token.findFirst({ where: { token } });
//     if (!tokenExist) {
//       throw new HttpError("Token no válido", 400);
//     }
//     const currentTime = new Date();
//     if (currentTime > tokenExist.expiresAt) {
//       throw new HttpError("El token ha expirado", 400);
//     }
//   },

//   async updatePassword({ token, password }: UserUpdatePasswordForm) {
//     //validar que exista el token
//     const tokenExist = await prisma.token.findFirst({ where: { token } });
//     if (!tokenExist) {
//       throw new HttpError("Token no válido", 400);
//     }
//     //validar que no haya vencido el token
//     const currentTime = new Date();
//     if (currentTime > tokenExist.expiresAt) {
//       throw new HttpError("El token ha expirado", 400);
//     }
//     //buscamos el usuario
//     const userExist = await prisma.user.findUnique({
//       where: { id: tokenExist.user_id },
//     });
//     if (userExist) {
//       //hasheamos el nuevo passwords
//       const newPassword = (userExist.password = await hashPassword(password));
//       //actualizamos el usuario con el nuevo password y eliminamos el token
//       await prisma.$transaction([
//         prisma.user.update({
//           where: { id: userExist.id },
//           data: { password: newPassword },
//         }),
//         prisma.token.delete({
//           where: { id: tokenExist.id },
//         }),
//       ]);
//     } else {
//       throw new HttpError("Usuario no encontrado", 400);
//     }
//   },
// };
