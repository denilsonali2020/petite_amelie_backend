import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import colors from "colors";
import { SOCKET_EVENTS, ROOMS } from "../../constants/event.js";

let io: SocketIOServer;

export const initSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    console.log(colors.green(`Socket conectado: ${socket.id}`));

    // Evento dinámico para unirse a salas (Kitchen o Cashier)
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (room: string) => {
      const validRooms = Object.values(ROOMS);
      
      if (validRooms.includes(room as any)) {
        socket.join(room);
        console.log(colors.yellow(`Cliente ${socket.id} se unió a la sala: ${room}`));
      } else {
        console.log(colors.red(`Intento de unión a sala inválida: ${room}`));
      }
    });

    socket.on("disconnect", () => {
      console.log(colors.red(`Socket desconectado: ${socket.id}`));
    });
  });

  return io;
};

// Función para obtener la instancia en los controladores
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io no ha sido inicializado. Llama a initSocket primero.");
  }
  return io;
};