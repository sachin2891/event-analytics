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

export function emitLiveCountUpdate(data: {
  eventName: string;
  count: number;
}) {
  if (!io) {
    console.error("❌ Socket.IO not initialized");
    return;
  }

  // console.log("📤 Emitting:", data); // add debug
  io.emit("eventCountUpdate", data);
}

export { io };
