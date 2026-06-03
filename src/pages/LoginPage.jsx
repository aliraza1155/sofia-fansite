import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to log in");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 20px" }}>
      <div style={{ background: "#141414", borderRadius: 24, padding: "40px", border: `1px solid ${BORDER}` }}>
        <h1 style={{ color: "#fff", textAlign: "center", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Welcome Back</h1>
        <p style={{ color: "#888", textAlign: "center", marginBottom: 32 }}>Sign in to your account</p>
        {error && <div style={{ background: "#2a1515", border: `1px solid #5a2020`, borderRadius: 8, padding: "10px", color: "#ff8080", marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: "14px", marginBottom: 16, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "14px", marginBottom: 16, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
          <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#555" : `linear-gradient(135deg, ${PINK}, #c73460)`, border: "none", padding: "14px", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Log In</button>
        </form>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/forgot-password" style={{ color: PINK, fontSize: 13 }}>Forgot password?</Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, color: "#888", fontSize: 13 }}>
          Don't have an account? <Link to="/signup" style={{ color: PINK }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}