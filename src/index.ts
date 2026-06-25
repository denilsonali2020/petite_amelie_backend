import http from "http"; // Módulo nativo de Node
import server from "./server.js"; // Tu app de Express
import colors from "colors";
import { initSocket } from "./modules/socket/socket.service.js"; // El servicio que crearemos

const port = process.env.PORT || 4000;

// Creamos el servidor HTTP usando la app de Express
const httpServer = http.createServer(server);

// Inicializamos Socket.io pasándole el servidor HTTP
initSocket(httpServer);

// scuchamos desde 'httpServer', no desde 'server' (Express)
httpServer.listen(port, () => {
  console.log(
    colors.cyan.bold(`REST API y WebSockets funcionando en el puerto: ${port}`),
  );
});