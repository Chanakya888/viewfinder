import { io } from "socket.io-client";

// In dev, connect to local server. In production, same origin (no cross-origin issues).
const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? "";

export const socket = io(SERVER_URL, { autoConnect: false });
