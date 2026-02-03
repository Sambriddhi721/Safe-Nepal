import { io } from "socket.io-client";
import { API_BASE } from "../config";

// Create socket with error handling and timeout
export const socket = io(API_BASE, {
  autoConnect: false, // connect only after login
  transports: ["websocket"],
  timeout: 5000, // 5 second connection timeout
  reconnection: false, // Don't auto-reconnect if it fails
});

// Add error handlers to prevent blocking
socket.on("connect_error", (error) => {
  console.log("Socket connection error (backend may be offline):", error.message);
});

socket.on("error", (error) => {
  console.log("Socket error:", error);
});
