import { transporter } from "../config/nodemailer.js";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    await transporter.sendMail({
      from: "Nook's <admin@nooks.com>",
      to: user.email,
      subject: "Nook's - Confirma tu Cuenta",
      text: "Confirma tu Cuenta",
      html: `<p>Hola: ${user.name}, has creado tu cuenta en Nook's, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
        <p>Visita el siguinte enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
        <p>E ingresa el token: <b>${user.token}</b> </p>
        <p>Este token expira en 10 minutos</p>
      `,
    });
  };

  //PENDIENTE DE MODIFICAR
  static sendPasswordResetToken = async (user: IEmail) => {
    // const info = 
    await transporter.sendMail({
      from: "Nook's <admin@nooks.com>",
      to: user.email,
      subject: "Nook's - Reestablece tu Password",
      text: "Reestablece tu Password",
      html: `<p>Hola: ${user.name}, has solicitado reestablecer tu password, si no fuiste tu, puedes ignorar este e-mail</p>
        <p>Visita el siguinte enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
        <p>E ingresa el token: <b>${user.token}</b> </p>
        <p>Este token expira en 10 minutos</p>
      `,
    });
    // console.log("Mensaje Enviado", info.messageId);
  };
}
