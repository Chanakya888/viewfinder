import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

// --- Socket.IO event maps ---

interface ClientToServerEvents {
  "join-session": (payload: { sessionId: string; role: "shooter" | "viewer" }) => void;
  "photo": (payload: { sessionId: string; imageData: string }) => void;
  "end-session": (payload: { sessionId: string }) => void;
}

interface ServerToClientEvents {
  "joined": (payload: { sessionId: string }) => void;
  "session-error": (payload: { message: string }) => void;
  "photo": (payload: { imageData: string }) => void;
  "viewer-joined": (payload: { viewers: number }) => void;
  "viewer-left": (payload: { viewers: number }) => void;
  "shooter-disconnected": () => void;
}

interface SocketData {
  sessionId: string;
  role: "shooter" | "viewer";
}

// --- Session store ---

interface Session {
  createdAt: number;
}

const sessions: Record<string, Session> = {};

async function getViewerCount(sessionId: string): Promise<number> {
  const sockets = await io.in(sessionId).fetchSockets();
  return sockets.filter((s) => s.data.role === "viewer").length;
}

// --- Express + Socket.IO setup ---

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 5e6,
});

// --- API routes ---

app.get("/session/health", (_req, res) => res.json({ status: "ok" }));

app.post("/session", (_req, res) => {
  const sessionId = uuidv4().slice(0, 8);
  sessions[sessionId] = { createdAt: Date.now() };
  res.json({ sessionId });
});

app.get("/session/:id", (req, res) => {
  const { id } = req.params;
  if (sessions[id]) {
    res.json({ exists: true });
  } else {
    res.status(404).json({ exists: false });
  }
});

// --- Serve frontend static files ---

const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) res.status(404).send("Not found");
  });
});

// --- Socket.IO handlers ---

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-session", async ({ sessionId, role }) => {
    if (!sessions[sessionId]) {
      socket.emit("session-error", { message: "Session not found" });
      return;
    }

    socket.join(sessionId);
    socket.data.sessionId = sessionId;
    socket.data.role = role;

    if (role === "viewer") {
      const viewers = await getViewerCount(sessionId);
      socket.to(sessionId).emit("viewer-joined", { viewers });
    }

    console.log(`${role} joined session ${sessionId}`);
    socket.emit("joined", { sessionId });
  });

  socket.on("photo", ({ sessionId, imageData }) => {
    socket.to(sessionId).emit("photo", { imageData });
    console.log(`Photo broadcast to session ${sessionId}`);
  });

  socket.on("end-session", ({ sessionId }) => {
    if (sessions[sessionId]) {
      socket.to(sessionId).emit("shooter-disconnected");
      delete sessions[sessionId];
      console.log(`Session ${sessionId} ended by shooter`);
    }
    socket.disconnect();
  });

  socket.on("disconnect", async () => {
    const { sessionId, role } = socket.data;
    if (sessionId && sessions[sessionId]) {
      if (role === "viewer") {
        const viewers = await getViewerCount(sessionId);
        socket.to(sessionId).emit("viewer-left", { viewers });
        console.log(`Viewer left session ${sessionId}, count: ${viewers}`);
      }
      if (role === "shooter") {
        socket.to(sessionId).emit("shooter-disconnected");
        delete sessions[sessionId];
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
server.listen(PORT, () => {
  console.log(`viewfinder server running on port ${PORT}`);
});
