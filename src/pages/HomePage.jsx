// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { contentHelpers } from "../lib/supabase";
import { AuthModal } from "../components/AuthModal";
import { SubscriptionModal } from "../components/PaymentModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

const PLANS = [
  { id: "monthly", label: "$19.99 / month", desc: "Cancel anytime", badge: null },
  { id: "3month", label: "$49.99 / 3 months", desc: "Best Value", badge: "MOST POPULAR" },
  { id: "6month", label: "$89.99 / 6 months", desc: "Limited Time Offer", badge: null },
];

export function HomePage({ onNavigate }) {
  const { fan, isSubscribed, hasAccess } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("3month");
  const [showAuth, setShowAuth] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const data = await contentHelpers.getAll("photo");
        setPhotos(data);
        const urls = {};
        const previewData = data.slice(0, 6);
        for (const photo of previewData) {
          const accessible = hasAccess(photo);
          if (accessible) {
            urls[photo.id] = contentHelpers.getPublicUrl("content", photo.storage_path);
          } else if (photo.thumbnail_path) {
            urls[photo.id] = contentHelpers.getPublicUrl("thumbnails", photo.thumbnail_path);
          } else {
            urls[photo.id] = contentHelpers.getPublicUrl("content", photo.storage_path);
          }
        }
        setImageUrls(urls);
      } catch (err) {
        console.error("Error fetching preview photos:", err);
      }
    };
    fetchPhotos();
  }, [hasAccess]);

  const preview = photos.slice(0, 6);

  function handleJoin() {
    if (!fan) { setShowAuth(true); return; }
    setShowSub(true);
  }

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 10,
    padding: "14px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, alignItems: "start" }}>
      {/* LEFT — Hero */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 420, background: "#111" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.2) 100%)",
          zIndex: 1,
        }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 28, zIndex: 2 }}>
          <div style={{ color: "#aaa", fontSize: 11, letterSpacing: 3, marginBottom: 4 }}>WELCOME TO</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, lineHeight: 1.1, marginBottom: 12 }}>
            Sofia's<br /><span style={{ fontStyle: "italic", color: PINK }}>Private World</span>
          </div>
          <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            Exclusive content. Real connection. Be part of my inner circle.
          </p>
          {[
            ["🔒", "Exclusive Photos & Videos"],
            ["💬", "Direct Messages"],
            ["🎬", "Behind the Scenes"],
            ["⭐", "New Content Weekly"],
            ["🎁", "Special Offers & Discounts"],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ color: "#ccc", fontSize: 13 }}>{text}</span>
            </div>
          ))}
          <div style={{
            marginTop: 20, background: "rgba(255,255,255,0.05)", borderRadius: 12,
            padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ display: "flex" }}>
              {["👤","👤","👤","👤"].map((a, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "50%", background: `hsl(${i*40},50%,40%)`,
                  border: "2px solid #0D0D0D", marginLeft: i ? -8 : 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                }}>{a}</div>
              ))}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>10,000+ Members</div>
              <div style={{ color: "#888", fontSize: 11 }}>Join thousands of fans</div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 3, display: "none" }} />
      </div>

      {/* MIDDLE — Photo Preview Grid */}
      <div>
        <div style={{ color: "#888", fontSize: 11, letterSpacing: 2, marginBottom: 14 }}>FREE PREVIEW</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
          {preview.length === 0
            ? Array(6).fill(null).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: "3/4", borderRadius: 8,
                  background: i < 3 ? "#2a2a2a" : "#1a1a1a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {i >= 3 && <span style={{ fontSize: 20, opacity: 0.4 }}>🔒</span>}
                </div>
              ))
            : preview.map((photo) => {
                const accessible = hasAccess(photo);
                const imgUrl = imageUrls[photo.id];
                const isLocked = !accessible;
                return (
                  <div key={photo.id} style={{
                    aspectRatio: "3/4", borderRadius: 8, overflow: "hidden",
                    background: "#1a1a1a", position: "relative",
                  }}>
                    {imgUrl ? (
                      <>
                        <img
                          src={imgUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: isLocked ? "blur(3px)" : "none",
                          }}
                        />
                        {isLocked && (
                          <div style={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            background: "rgba(0,0,0,0.6)",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 12,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            zIndex: 2,
                          }}>
                            <span>🔒</span> <span style={{ fontSize: 10 }}>Locked</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", display: "flex", alignItems: "center",
                        justifyContent: "center", flexDirection: "column", gap: 4,
                        background: "#1a1a1a",
                      }}>
                        <span style={{ fontSize: 20, opacity: 0.4 }}>🔒</span>
                      </div>
                    )}
                  </div>
                );
              })
          }
        </div>
        <button onClick={handleJoin} style={{
          width: "100%", background: "transparent", border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: "14px", color: "#fff", fontSize: 13, fontWeight: 700,
          cursor: "pointer", letterSpacing: 1, fontFamily: "inherit",
        }}>
          🔒 UNLOCK ALL PHOTOS & VIDEOS
        </button>
      </div>

      {/* RIGHT — Join Panel */}
      <div style={{ background: "#111", borderRadius: 16, padding: "28px 24px", border: `1px solid ${BORDER}` }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>
          JOIN SOFIA <span style={{ color: PINK }}>♥</span>
        </div>
        <div style={{ color: "#888", fontSize: 12, textAlign: "center", marginBottom: 24 }}>
          GET FULL ACCESS TO MY EXCLUSIVE CONTENT
        </div>

        {fan ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {isSubscribed ? (
              <div style={{ color: PINK, fontWeight: 700 }}>✓ You're a member! Enjoy all content.</div>
            ) : (
              <>
                <div style={{ color: "#888", marginBottom: 16, fontSize: 13 }}>
                  Welcome back, {fan.email}!<br />Choose a plan to unlock everything.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {PLANS.map((p) => (
                    <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{
                      border: `2px solid ${selectedPlan === p.id ? PINK : BORDER}`,
                      borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                      background: selectedPlan === p.id ? "rgba(232,84,122,0.1)" : "#1a1a1a",
                      position: "relative",
                    }}>
                      {p.badge && (
                        <div style={{
                          position: "absolute", top: -9, right: 10,
                          background: PINK, borderRadius: 5, padding: "2px 7px",
                          fontSize: 9, fontWeight: 700, color: "#fff",
                        }}>{p.badge}</div>
                      )}
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{p.label}</div>
                      <div style={{ color: "#888", fontSize: 11 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowSub(true)} style={{
                  width: "100%", background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                  border: "none", borderRadius: 12, padding: "16px",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  letterSpacing: 1, fontFamily: "inherit",
                }}>
                  🔒 JOIN NOW
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <input placeholder="Full Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle} />
              <input type="email" placeholder="Email Address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle} />
              <div style={{
                background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: "12px 14px", display: "flex", gap: 10, alignItems: "center",
              }}>
                <span style={{ fontSize: 16 }}>🔒</span>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>Password is auto-generated</div>
                  <div style={{ color: "#666", fontSize: 11 }}>A secure password will be sent to your email</div>
                </div>
              </div>
            </div>

            <div style={{ color: "#888", fontSize: 11, marginBottom: 10, letterSpacing: 1 }}>CHOOSE YOUR PLAN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {PLANS.map((p) => (
                <div key={p.id} onClick={() => setSelectedPlan(p.id)} style={{
                  border: `2px solid ${selectedPlan === p.id ? PINK : BORDER}`,
                  borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                  background: selectedPlan === p.id ? "rgba(232,84,122,0.1)" : "#1a1a1a",
                  position: "relative",
                }}>
                  {p.badge && (
                    <div style={{
                      position: "absolute", top: -9, right: 10,
                      background: PINK, borderRadius: 5, padding: "2px 7px",
                      fontSize: 9, fontWeight: 700, color: "#fff",
                    }}>{p.badge}</div>
                  )}
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{p.label}</div>
                  <div style={{ color: "#888", fontSize: 11 }}>{p.desc}</div>
                </div>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, cursor: "pointer" }}>
              <div style={{ width: 34, height: 20, background: "#333", borderRadius: 10, position: "relative" }}>
                <div style={{ width: 14, height: 14, background: "#666", borderRadius: "50%", position: "absolute", top: 3, left: 3 }} />
              </div>
              <span style={{ color: "#888", fontSize: 11 }}>
                I agree to the <span style={{ color: PINK }}>Terms of Use</span> and confirm I am 18+
              </span>
            </label>

            <button onClick={() => setShowAuth(true)} style={{
              width: "100%", background: `linear-gradient(135deg, ${PINK}, #c73460)`,
              border: "none", borderRadius: 12, padding: "16px",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              letterSpacing: 1, fontFamily: "inherit", marginBottom: 8,
            }}>
              🔒 JOIN NOW
            </button>
            <div style={{ textAlign: "center", color: "#555", fontSize: 11 }}>🔒 SECURE & DISCREET</div>
          </>
        )}
      </div>

      {/* Footer Feature Cards */}
      <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
        {[
          ["⚙️", "100% EXCLUSIVE", "Content you won't find anywhere else"],
          ["💬", "DIRECT ACCESS", "Message me and get personal replies"],
          ["♥", "NEW CONTENT WEEKLY", "Fresh photos & videos added regularly"],
          ["🔒", "SAFE & SECURE", "Your privacy is my top priority"],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{
            background: "#111", borderRadius: 12, padding: "20px 16px",
            border: `1px solid ${BORDER}`, textAlign: "center",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>{title}</div>
            <div style={{ color: "#666", fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {showAuth && (
        <AuthModal
          mode="signup"
          selectedPlan={selectedPlan}
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); setShowSub(true); }}
        />
      )}
      {showSub && (
        <SubscriptionModal
          onClose={() => setShowSub(false)}
          onLogin={() => { setShowSub(false); setShowAuth(true); }}
        />
      )}
    </div>
  );
}