import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../lib/socket";

const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export default function Shoot() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [viewers, setViewers] = useState(0);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(false);
  const [connected, setConnected] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const viewerLink = `${APP_URL}/view/${sessionId}`;

  // Start camera — called directly from a tap so iOS Safari grants permission
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraReady(true);
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera in Settings.");
      console.error(err);
    }
  };

  // Attach stream after the video element renders
  useEffect(() => {
    if (cameraReady && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraReady]);

  // Connect socket
  useEffect(() => {
    socket.connect();
    socket.emit("join-session", { sessionId, role: "shooter" });

    socket.on("joined", () => setConnected(true));
    socket.on("viewer-joined", ({ viewers }: { viewers: number }) =>
      setViewers(viewers)
    );
    socket.on("viewer-left", ({ viewers }: { viewers: number }) =>
      setViewers(viewers)
    );

    return () => {
      socket.off("joined");
      socket.off("viewer-joined");
      socket.off("viewer-left");
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
      socket.disconnect();
    };
  }, [sessionId]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    socket.emit("photo", { sessionId, imageData });

    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(viewerLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endSession = () => {
    socket.emit("end-session", { sessionId });
    navigate("/");
  };

  // Camera permission gate
  if (!cameraReady) {
    return (
      <div className="screen center">
        {cameraError ? (
          <p className="error-msg">{cameraError}</p>
        ) : (
          <>
            <p className="subtitle">Tap to enable your camera</p>
            <button className="btn-primary" onClick={startCamera}>
              Enable Camera
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="screen shoot-screen">
      {flash && <div className="flash-overlay" />}

      {/* Top bar */}
      <div className="top-bar">
        <button className="btn-end" onClick={endSession}>End</button>
        <div className="viewers-badge">
          {viewers} viewer{viewers !== 1 ? "s" : ""}
        </div>
        <button className="btn-copy" onClick={copyLink}>
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-feed"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Capture button */}
      <div className="bottom-bar">
        <button
          className="btn-capture"
          onClick={capture}
          disabled={!connected}
        />
      </div>
    </div>
  );
}
