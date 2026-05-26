import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/session`, { method: "POST" });
      const { sessionId } = (await res.json()) as { sessionId: string };
      navigate(`/shoot/${sessionId}`);
    } catch (err) {
      console.error("Failed to create session", err);
      setLoading(false);
    }
  };

  return (
    <div className="screen center">
      <h1 className="logo">viewfinder</h1>
      <p className="subtitle">Instant photo feedback for shoots</p>
      <button className="btn-primary" onClick={startSession} disabled={loading}>
        {loading ? "Starting..." : "Start Session"}
      </button>
      <a
        className="built-by"
        href="https://chanakyakilaru.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        from the desk of Chanakya Kilaru
      </a>
    </div>
  );
}
