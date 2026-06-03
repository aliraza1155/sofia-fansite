import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage("Check your email for a password reset link.");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 20px" }}>
      <div style={{ background: "#141414", borderRadius: 24, padding: "40px", border: `1px solid ${BORDER}` }}>
        <h1 style={{ color: "#fff", textAlign: "center", marginBottom: 8 }}>Reset Password</h1>
        <p style={{ color: "#888", textAlign: "center", marginBottom: 32 }}>Enter your email to receive a reset link</p>
        {error && <div style={{ background: "#2a1515", border: `1px solid #5a2020`, borderRadius: 8, padding: "10px", color: "#ff8080", marginBottom: 16 }}>{error}</div>}
        {message && <div style={{ background: "#154a2a", border: `1px solid #2a5a20`, borderRadius: 8, padding: "10px", color: "#80ff80", marginBottom: 16 }}>{message}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: "14px", marginBottom: 16, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
          <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#555" : `linear-gradient(135deg, ${PINK}, #c73460)`, border: "none", padding: "14px", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Send Reset Link</button>
        </form>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/login" style={{ color: PINK }}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
}