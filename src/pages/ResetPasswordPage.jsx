// src/pages/ResetPasswordPage.jsx
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setMessage("Password updated successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to update password");
    }
    setLoading(false);
  }

  return (
    <>
      <Helmet>
        <title>Set New Password – Sofia Varelli Account</title>
        <meta name="description" content="Create a new password for your Sofia Varelli account." />
        <link rel="canonical" href="https://sofiavarelli.com/reset-password" />
      </Helmet>
      <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 20px" }}>
        <div style={{ background: "#141414", borderRadius: 24, padding: "40px", border: `1px solid ${BORDER}` }}>
          <h1 style={{ color: "#fff", textAlign: "center", marginBottom: 8 }}>Set New Password</h1>
          <p style={{ color: "#888", textAlign: "center", marginBottom: 32 }}>Create a new password for your account</p>
          {error && <div style={{ background: "#2a1515", border: `1px solid #5a2020`, borderRadius: 8, padding: "10px", color: "#ff8080", marginBottom: 16 }}>{error}</div>}
          {message && <div style={{ background: "#154a2a", border: `1px solid #2a5a20`, borderRadius: 8, padding: "10px", color: "#80ff80", marginBottom: 16 }}>{message}</div>}
          <form onSubmit={handleSubmit}>
            <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "14px", marginBottom: 16, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ width: "100%", padding: "14px", marginBottom: 16, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
            <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#555" : `linear-gradient(135deg, ${PINK}, #c73460)`, border: "none", padding: "14px", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Update Password</button>
          </form>
        </div>
      </div>
    </>
  );
}