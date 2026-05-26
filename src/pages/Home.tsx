import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const startSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/session`, { method: "POST" });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const { sessionId } = (await res.json()) as { sessionId: string };
      navigate(`/shoot/${sessionId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
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
      {error && <p className="error-msg">{error}</p>}
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
