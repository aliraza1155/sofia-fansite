// src/components/PaymentModal.jsx
// Handles subscription, PPV, bundle, message unlock, and tips
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ccbill } from "../lib/ccbill";

const PINK = "#E8547A";
const CARD = "#141414";
const BORDER = "#2a2a2a";

const PLANS = [
  { id: "monthly", label: "$19.99 / month", desc: "Cancel anytime", badge: null },
  { id: "3month", label: "$49.99 / 3 months", desc: "Best Value — Save 17%", badge: "MOST POPULAR" },
  { id: "6month", label: "$89.99 / 6 months", desc: "Limited Time Offer — Save 25%", badge: null },
];

const TIP_AMOUNTS = [5, 10, 20, 50, 100];

// ============================================================
// SUBSCRIPTION PLAN SELECTOR
// ============================================================
export function SubscriptionModal({ onClose, onLogin }) {
  const { fan } = useAuth();
  const [plan, setPlan] = useState("3month");

  function checkout() {
    if (!fan) { onLogin?.(plan); return; }
    const url = ccbill.getSubscriptionUrl({
      plan,
      fanId: fan.id,
      fanEmail: fan.email,
      fanName: fan.user_metadata?.full_name,
    });
    window.open(url, "_blank");
  }

  return (
    <Modal onClose={onClose} title={<>JOIN SOFIA <span style={{ color: PINK }}>♥</span></>} subtitle="Get full access to my exclusive content">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {PLANS.map((p) => (
          <div key={p.id} onClick={() => setPlan(p.id)} style={{
            border: `2px solid ${plan === p.id ? PINK : BORDER}`,
            borderRadius: 12, padding: "14px 16px", cursor: "pointer",
            background: plan === p.id ? "rgba(232,84,122,0.1)" : "#1a1a1a",
            display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
            position: "relative",
          }}>
            {p.badge && (
              <div style={{
                position: "absolute", top: -10, right: 12,
                background: PINK, borderRadius: 6, padding: "2px 8px",
                fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: 1,
              }}>{p.badge}</div>
            )}
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: `2px solid ${plan === p.id ? PINK : "#555"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {plan === p.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: PINK }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{p.label}</div>
              <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <PrimaryButton onClick={checkout}>🔒 JOIN NOW — {PLANS.find((p) => p.id === plan)?.label}</PrimaryButton>
      <div style={{ textAlign: "center", color: "#555", fontSize: 11, marginTop: 10 }}>
        🔒 SECURE & DISCREET · Powered by CCBill
      </div>
    </Modal>
  );
}

// ============================================================
// PAY-PER-VIEW MODAL
// ============================================================
export function PPVModal({ content, onClose }) {
  const { fan } = useAuth();

  function checkout() {
    if (!fan) { alert("Please log in to purchase content."); return; }
    const url = ccbill.getPPVUrl({
      contentId: content.id,
      price: content.ppv_price,
      fanId: fan.id,
      fanEmail: fan.email,
      contentTitle: content.title,
    });
    window.open(url, "_blank");
  }

  return (
    <Modal onClose={onClose} title="Unlock Content" subtitle="One-time purchase — access forever">
      <div style={{
        background: "#1a1a1a", borderRadius: 12, padding: "20px",
        marginBottom: 20, textAlign: "center", border: `1px solid ${BORDER}`,
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          {content.title || "Exclusive Content"}
        </div>
        <div style={{ color: PINK, fontSize: 28, fontWeight: 800 }}>
          ${content.ppv_price?.toFixed(2)}
        </div>
        <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>One-time unlock · Keep forever</div>
      </div>
      <PrimaryButton onClick={checkout}>Unlock for ${content.ppv_price?.toFixed(2)}</PrimaryButton>
      <div style={{ textAlign: "center", color: "#555", fontSize: 11, marginTop: 10 }}>
        Or <span style={{ color: PINK, cursor: "pointer" }}>subscribe</span> to get all content
      </div>
    </Modal>
  );
}

// ============================================================
// BUNDLE MODAL
// ============================================================
export function BundleModal({ bundle, onClose }) {
  const { fan } = useAuth();

  function checkout() {
    if (!fan) { alert("Please log in to purchase bundles."); return; }
    const url = ccbill.getBundleUrl({
      bundleId: bundle.id,
      price: bundle.price,
      fanId: fan.id,
      fanEmail: fan.email,
      bundleTitle: bundle.title,
    });
    window.open(url, "_blank");
  }

  const savings = bundle.original_price
    ? Math.round(((bundle.original_price - bundle.price) / bundle.original_price) * 100)
    : null;

  return (
    <Modal onClose={onClose} title={bundle.title} subtitle={bundle.description}>
      <div style={{
        background: "#1a1a1a", borderRadius: 12, padding: "20px",
        marginBottom: 20, border: `1px solid ${BORDER}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: PINK, fontSize: 28, fontWeight: 800 }}>${bundle.price?.toFixed(2)}</div>
            {bundle.original_price && (
              <div style={{ color: "#555", fontSize: 13, textDecoration: "line-through" }}>
                ${bundle.original_price?.toFixed(2)}
              </div>
            )}
          </div>
          {savings && (
            <div style={{
              background: "rgba(232,84,122,0.2)", border: `1px solid ${PINK}`,
              borderRadius: 8, padding: "6px 12px", color: PINK, fontWeight: 700, fontSize: 13,
            }}>
              SAVE {savings}%
            </div>
          )}
        </div>
        <div style={{ color: "#888", fontSize: 12, marginTop: 12 }}>
          {bundle.bundle_items?.length || 0} items included · Permanent access
        </div>
        {bundle.expires_at && (
          <div style={{ color: "#ff8080", fontSize: 12, marginTop: 6 }}>
            ⏳ Offer expires {new Date(bundle.expires_at).toLocaleDateString()}
          </div>
        )}
      </div>
      <PrimaryButton onClick={checkout}>Buy Bundle — ${bundle.price?.toFixed(2)}</PrimaryButton>
    </Modal>
  );
}

// ============================================================
// MESSAGE UNLOCK MODAL
// ============================================================
export function MessageUnlockModal({ message, onClose }) {
  const { fan } = useAuth();

  function checkout() {
    if (!fan) { alert("Please log in."); return; }
    const url = ccbill.getMessageUnlockUrl({
      messageId: message.id,
      price: message.locked_media_price,
      fanId: fan.id,
      fanEmail: fan.email,
    });
    window.open(url, "_blank");
  }

  return (
    <Modal onClose={onClose} title="Unlock Message" subtitle="Sofia sent you exclusive content">
      <div style={{
        background: "#1a1a1a", borderRadius: 12, padding: "24px",
        marginBottom: 20, textAlign: "center", border: `1px solid ${BORDER}`,
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💌</div>
        <div style={{ color: "#fff", fontSize: 15, marginBottom: 16, fontStyle: "italic" }}>
          "I made this just for you..."
        </div>
        <div style={{ color: PINK, fontSize: 28, fontWeight: 800 }}>
          ${message.locked_media_price?.toFixed(2)}
        </div>
        <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>to unlock Sofia's exclusive content</div>
      </div>
      <PrimaryButton onClick={checkout}>Unlock for ${message.locked_media_price?.toFixed(2)}</PrimaryButton>
    </Modal>
  );
}

// ============================================================
// TIP MODAL
// ============================================================
export function TipModal({ onClose, contentId }) {
  const { fan } = useAuth();
  const [selected, setSelected] = useState(10);
  const [custom, setCustom] = useState("");
  const [tipMessage, setTipMessage] = useState("");

  const amount = custom ? parseFloat(custom) : selected;

  function checkout() {
    if (!fan) { alert("Please log in to send a tip."); return; }
    if (!amount || amount < 1) { alert("Please select a tip amount."); return; }
    const url = ccbill.getTipUrl({
      amount,
      fanId: fan.id,
      fanEmail: fan.email,
      contentId,
      message: tipMessage,
    });
    window.open(url, "_blank");
  }

  return (
    <Modal onClose={onClose} title={<>Send a Tip <span style={{ color: "#f5a623" }}>💛</span></>} subtitle="Show Sofia some love">
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#888", fontSize: 12, marginBottom: 10, letterSpacing: 1 }}>CHOOSE AMOUNT</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {TIP_AMOUNTS.map((a) => (
            <button key={a} onClick={() => { setSelected(a); setCustom(""); }}
              style={{
                padding: "10px 16px", borderRadius: 10, border: `2px solid ${!custom && selected === a ? PINK : BORDER}`,
                background: !custom && selected === a ? "rgba(232,84,122,0.15)" : "#1a1a1a",
                color: !custom && selected === a ? PINK : "#fff",
                cursor: "pointer", fontWeight: 700, fontSize: 15, fontFamily: "inherit",
                flex: "1 1 auto", transition: "all 0.2s",
              }}>
              ${a}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Custom amount ($)"
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "#1a1a1a", border: `1px solid ${custom ? PINK : BORDER}`, borderRadius: 10,
            padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit",
          }}
        />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#888", fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>MESSAGE (optional)</div>
        <textarea
          placeholder="Say something to Sofia..."
          value={tipMessage}
          onChange={(e) => setTipMessage(e.target.value)}
          rows={3}
          style={{
            width: "100%", boxSizing: "border-box", resize: "none",
            background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 10,
            padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit",
          }}
        />
      </div>
      <PrimaryButton onClick={checkout} disabled={!amount || amount < 1}>
        💛 Send ${amount?.toFixed(2) || "0.00"} Tip
      </PrimaryButton>
    </Modal>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Modal({ onClose, title, subtitle, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: 20,
    }}>
      <div style={{
        background: CARD, borderRadius: 18, padding: "36px 32px",
        width: "100%", maxWidth: 420, position: "relative",
        border: `1px solid ${BORDER}`, maxHeight: "90vh", overflowY: "auto",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20,
        }}>✕</button>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>
            {title}
          </div>
          {subtitle && <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
        </div>

        {children}
      </div>
    </div>
  );
}

function PrimaryButton({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", background: disabled ? "#333" : `linear-gradient(135deg, ${PINK}, #c73460)`,
      border: "none", borderRadius: 12, padding: "16px",
      color: "#fff", fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      letterSpacing: 1, fontFamily: "inherit", transition: "all 0.2s",
    }}>
      {children}
    </button>
  );
}