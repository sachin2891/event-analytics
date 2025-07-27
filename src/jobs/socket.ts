// socket.ts (simplified)
import { Server } from "socket.io";

let io: Server;

export function initSocketIO(server: any) {
  io = new Server(server, {
    cors: { origin: "*" },
  });
  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);
  });
}

export function emitLiveCountUpdate(count: number) {
  if (io) {
    io.emit("eventCountUpdate", { count });
  }
}
