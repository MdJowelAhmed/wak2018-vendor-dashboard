import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function connectSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://10.10.26.172:4060";
      
    // Usually socket server is at the base URL origin
    const urlObj = new URL(socketUrl);
    const origin = urlObj.origin;

    socket = io(origin, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });
  }
  return socket;
}
