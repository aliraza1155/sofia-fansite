import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

export function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!agreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 20px" }}>
      <div style={{ background: "#141414", borderRadius: 24, padding: "40px", border: `1px solid ${BORDER}` }}>
        <h1 style={{ color: "#fff", textAlign: "center", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Join Sofia</h1>
        <p style={{ color: "#888", textAlign: "center", marginBottom: 32 }}>Get exclusive access</p>
        {error && <div style={{ background: "#2a1515", border: `1px solid #5a2020`, borderRadius: 8, padding: "10px", color: "#ff8080", marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ width: "100%", padding: "14px", marginBottom: 16, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: "14px", marginBottom: 16, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "14px", marginBottom: 16, background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
          <label style={{ display: "flex", gap: 10, marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span style={{ color: "#888", fontSize: 12 }}>I agree to the <a href="/terms-of-service" target="_blank" style={{ color: PINK }}>Terms</a> and <a href="/privacy-policy" target="_blank" style={{ color: PINK }}>Privacy Policy</a></span>
          </label>
          <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#555" : `linear-gradient(135deg, ${PINK}, #c73460)`, border: "none", padding: "14px", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Sign Up</button>
        </form>
        <div style={{ textAlign: "center", marginTop: 16, color: "#888", fontSize: 13 }}>
          Already have an account? <Link to="/login" style={{ color: PINK }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}