import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../lib/socket";

type Status = "connecting" | "live" | "ended";

export default function View() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [photo, setPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("connecting");

  useEffect(() => {
    socket.connect();
    socket.emit("join-session", { sessionId, role: "viewer" });

    socket.on("joined", () => setStatus("live"));
    socket.on("session-error", () => setStatus("ended"));
    socket.on("photo", ({ imageData }: { imageData: string }) =>
      setPhoto(imageData)
    );
    socket.on("shooter-disconnected", () => setStatus("ended"));

    return () => {
      socket.off("joined");
      socket.off("session-error");
      socket.off("photo");
      socket.off("shooter-disconnected");
      socket.disconnect();
    };
  }, [sessionId]);

  if (status === "connecting") {
    return (
      <div className="screen center">
        <p className="subtitle">Connecting to session...</p>
      </div>
    );
  }

  if (status === "ended") {
    return (
      <div className="screen center">
        <h2>Session ended</h2>
        <p className="subtitle">The photographer has disconnected.</p>
      </div>
    );
  }

  return (
    <div className="screen view-screen">
      {photo ? (
        <img src={photo} alt="Latest shot" className="photo-view" />
      ) : (
        <div className="waiting">
          <div className="pulse-dot" />
          <p>Waiting for first shot...</p>
        </div>
      )}
    </div>
  );
}
