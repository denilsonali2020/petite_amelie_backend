import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({
  quiet: true, //comentario solo para minimizar informacion en consola una vez se ejecuta el backend
});

const config = () => {
  return {
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT!,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
};

export const transporter = nodemailer.createTransport(config());
