import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const PINK = "#E8547A";
const CARD = "#141414";
const BORDER = "#2a2a2a";

export function AuthModal({ mode = "signup", onClose, onSuccess, selectedPlan }) {
  const { signUp, signIn } = useAuth();
  const [tab, setTab] = useState(mode); // 'signup' | 'login'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PLANS = {
    monthly: { label: "$19.99 / month", desc: "Cancel anytime" },
    "3month": { label: "$49.99 / 3 months", desc: "Best Value" },
    "6month": { label: "$89.99 / 6 months", desc: "Limited Time Offer" },
  };

  async function handleSubmit() {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (tab === "signup" && !form.name) { setError("Please enter your name."); return; }
    if (tab === "signup" && !agreed) { setError("Please agree to the Terms of Use."); return; }

    setLoading(true);
    try {
      if (tab === "signup") {
        await signUp(form.email, form.password, form.name);
      } else {
        await signIn(form.email, form.password);
      }
      onSuccess?.();
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 10,
    padding: "14px 16px", color: "#fff", fontSize: 14,
    outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: 20,
    }}>
      <div style={{
        background: CARD, borderRadius: 18, padding: "36px 32px",
        width: "100%", maxWidth: 420, position: "relative",
        border: `1px solid ${BORDER}`,
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20,
        }}>✕</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>
            {tab === "signup" ? <>JOIN SOFIA <span style={{ color: PINK }}>♥</span></> : "WELCOME BACK"}
          </div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            {tab === "signup" ? "Get full access to exclusive content" : "Sign in to your account"}
          </div>
        </div>

        {/* Plan reminder */}
        {tab === "signup" && selectedPlan && (
          <div style={{
            background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 10,
            padding: "12px 16px", marginBottom: 18,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ color: "#888", fontSize: 12 }}>Selected Plan</div>
            <div style={{ color: PINK, fontWeight: 700, fontSize: 14 }}>{PLANS[selectedPlan]?.label}</div>
          </div>
        )}

        {/* Tab toggle */}
        <div style={{ display: "flex", background: "#1a1a1a", borderRadius: 10, padding: 4, marginBottom: 22 }}>
          {["signup", "login"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                background: tab === t ? PINK : "transparent",
                color: tab === t ? "#fff" : "#777",
                fontSize: 12, fontWeight: 700, letterSpacing: 1, fontFamily: "inherit",
                transition: "all 0.2s",
              }}>
              {t === "signup" ? "SIGN UP" : "LOG IN"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tab === "signup" && (
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
          />

          {tab === "signup" && (
            <>
              <div style={{
                background: "#1a1a1a", borderRadius: 10, padding: "12px 16px",
                border: `1px solid ${BORDER}`, display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Secure & Discreet</div>
                  <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>Your privacy and payment info are always protected</div>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <div
                  onClick={() => setAgreed(!agreed)}
                  style={{
                    width: 20, height: 20, borderRadius: 6, border: `2px solid ${agreed ? PINK : BORDER}`,
                    background: agreed ? PINK : "transparent", flexShrink: 0, marginTop: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s", cursor: "pointer",
                  }}>
                  {agreed && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                </div>
                <span style={{ color: "#888", fontSize: 12, lineHeight: 1.5 }}>
                  I agree to the <span style={{ color: PINK, cursor: "pointer" }}>Terms of Use</span> and confirm I am 18+
                </span>
              </label>
            </>
          )}

          {error && (
            <div style={{ background: "#2a1515", border: "1px solid #5a2020", borderRadius: 8, padding: "10px 14px", color: "#ff8080", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? "#555" : `linear-gradient(135deg, ${PINK}, #c73460)`,
              border: "none", borderRadius: 12, padding: "16px",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: 1, fontFamily: "inherit", marginTop: 4,
              transition: "all 0.2s",
            }}>
            {loading ? "Please wait..." : (tab === "signup" ? "🔒 JOIN NOW" : "LOG IN")}
          </button>
        </div>
      </div>
    </div>
  );
}