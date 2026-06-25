import { CorsOptions } from "cors";

//Permitir conexiones
// export const corsConfig: CorsOptions = {
//   origin: function (origin, callback) {
//     const whitelist = [process.env.FRONTEND_URL];
//     if (process.argv[2] === "--api") {
//       whitelist.push(undefined);
//     }
//     if (whitelist.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Error de CORS"));
//     }
//   },
//   credentials: true,
// };


export const corsConfig: CorsOptions = {
  origin(origin, callback) {
    // Peticiones sin Origin: Render health checks, Postman, etc.
    if (!origin) {
      return callback(null, true);
    }

    console.log("Origen bloqueado por CORS:", origin);
    return callback(new Error(`Error de CORS: ${origin}`));
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};