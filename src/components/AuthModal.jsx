// src/components/AuthModal.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const PINK = "#E8547A";
const CARD = "#141414";
const BORDER = "#2a2a2a";

function useWindowSize() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export function AuthModal({ mode = "signup", onClose, onSuccess, selectedPlan }) {
  const { signUp, signIn } = useAuth();
  const [tab, setTab] = useState(mode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const w = useWindowSize();
  const isMobile = w < 640;

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
    padding: isMobile ? "15px 16px" : "14px 16px",
    color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s",
    WebkitAppearance: "none",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: isMobile ? "flex-end" : "center",
      justifyContent: "center", zIndex: 999,
      padding: isMobile ? 0 : 20,
    }}>
      <div style={{
        background: CARD, borderRadius: isMobile ? "20px 20px 0 0" : 18,
        padding: isMobile ? "28px 20px 32px" : "36px 32px",
        width: "100%", maxWidth: isMobile ? "100%" : 420,
        position: "relative", border: `1px solid ${BORDER}`,
        maxHeight: isMobile ? "92vh" : "90vh", overflowY: "auto",
        // Drag handle on mobile
      }}>
        {/* Mobile drag handle */}
        {isMobile && (
          <div style={{
            width: 40, height: 4, background: "#333", borderRadius: 2,
            margin: "-10px auto 20px", display: "block",
          }} />
        )}

        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(255,255,255,0.08)", border: "none", color: "#888",
          cursor: "pointer", fontSize: 16, borderRadius: "50%",
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 20 : 22, fontWeight: 700, color: "#fff",
          }}>
            {tab === "signup" ? <>JOIN SOFIA <span style={{ color: PINK }}>♥</span></> : "WELCOME BACK"}
          </div>
          <div style={{ color: "#777", fontSize: 12, marginTop: 4 }}>
            {tab === "signup" ? "Get full access to exclusive content" : "Sign in to your account"}
          </div>
        </div>

        {/* Plan reminder */}
        {tab === "signup" && selectedPlan && (
          <div style={{
            background: "rgba(232,84,122,0.08)", border: `1px solid rgba(232,84,122,0.2)`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 16,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ color: "#888", fontSize: 11 }}>Selected Plan</div>
            <div style={{ color: PINK, fontWeight: 700, fontSize: 13 }}>{PLANS[selectedPlan]?.label}</div>
          </div>
        )}

        {/* Tab toggle */}
        <div style={{ display: "flex", background: "#1a1a1a", borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {["signup", "login"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
              flex: 1, padding: "9px", borderRadius: 8, border: "none", cursor: "pointer",
              background: tab === t ? PINK : "transparent",
              color: tab === t ? "#fff" : "#666",
              fontSize: 11, fontWeight: 700, letterSpacing: 1, fontFamily: "inherit",
              transition: "all 0.2s",
            }}>
              {t === "signup" ? "SIGN UP" : "LOG IN"}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {tab === "signup" && (
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              autoComplete="name"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
            autoComplete="email"
            inputMode="email"
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ ...inputStyle, paddingRight: 44 }}
              autoComplete={tab === "signup" ? "new-password" : "current-password"}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "#555", cursor: "pointer",
                fontSize: 16, padding: 4,
              }}
            >{showPass ? "🙈" : "👁️"}</button>
          </div>

          {tab === "signup" && (
            <>
              <div style={{
                background: "rgba(34,197,94,0.05)", borderRadius: 10, padding: "11px 14px",
                border: `1px solid rgba(34,197,94,0.15)`, display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>Secure &amp; Discreet</div>
                  <div style={{ color: "#777", fontSize: 11, marginTop: 2 }}>Your privacy and payment info are always protected</div>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                <div
                  onClick={() => setAgreed(!agreed)}
                  style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `2px solid ${agreed ? PINK : BORDER}`,
                    background: agreed ? PINK : "transparent", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s", cursor: "pointer", marginTop: 1,
                  }}
                >
                  {agreed && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ color: "#777", fontSize: 12, lineHeight: 1.5 }}>
                  I agree to the <span style={{ color: PINK }}>Terms of Use</span> and confirm I am 18+
                </span>
              </label>
            </>
          )}

          {error && (
            <div style={{
              background: "#1a0a0a", border: "1px solid #5a2020",
              borderRadius: 8, padding: "10px 14px", color: "#ff8080", fontSize: 12,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? "#333" : `linear-gradient(135deg, ${PINK}, #c73460)`,
              border: "none", borderRadius: 12,
              padding: isMobile ? "17px" : "16px",
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: 1, fontFamily: "inherit", marginTop: 4,
              transition: "all 0.2s", width: "100%",
              WebkitAppearance: "none",
            }}
          >
            {loading ? "Please wait..." : tab === "signup" ? "🔒 JOIN NOW" : "LOG IN →"}
          </button>
        </div>

        {/* Switch mode hint */}
        <div style={{ textAlign: "center", marginTop: 16, color: "#555", fontSize: 12 }}>
          {tab === "signup" ? (
            <>Already a member? <span onClick={() => setTab("login")} style={{ color: PINK, cursor: "pointer" }}>Log in</span></>
          ) : (
            <>New here? <span onClick={() => setTab("signup")} style={{ color: PINK, cursor: "pointer" }}>Create account</span></>
          )}
        </div>
      </div>
    </div>
  );
}