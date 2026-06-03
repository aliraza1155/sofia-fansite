// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { contentHelpers } from "../lib/supabase";
import { AuthModal } from "../components/AuthModal";
import { SubscriptionModal } from "../components/PaymentModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

const PLANS = [
  { id: "monthly", label: "$19.99 / month", desc: "Cancel anytime", badge: null },
  { id: "3month", label: "$49.99 / 3 months", desc: "Best Value — Save 17%", badge: "MOST POPULAR" },
  { id: "6month", label: "$89.99 / 6 months", desc: "Limited Time Offer — Save 25%", badge: null },
];

const FEATURES = [
  { icon: "🔒", title: "100% EXCLUSIVE", desc: "Content you won't find anywhere else" },
  { icon: "💬", title: "DIRECT ACCESS", desc: "Message me and get personal replies" },
  { icon: "♥", title: "NEW CONTENT WEEKLY", desc: "Fresh photos & videos added regularly" },
  { icon: "🛡️", title: "SAFE & SECURE", desc: "Your privacy is my top priority" },
];

function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth });
  useEffect(() => {
    const h = () => setSize({ w: window.innerWidth });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return size;
}

export function HomePage({ onNavigate }) {
  const { fan, isSubscribed, hasAccess } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("3month");
  const [showAuth, setShowAuth] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [imageUrls, setImageUrls] = useState({});
  const { w } = useWindowSize();

  const isMobile = w < 640;
  const isTablet = w < 1024;

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
    padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none",
    fontFamily: "inherit", transition: "border-color 0.2s",
  };

  // ── MOBILE LAYOUT ──
  if (isMobile) {
    return (
      <>
        <Helmet>
          <title>Sofia Varelli – Exclusive Fan Site | Join for Private Content</title>
          <meta name="description" content="Join Sofia Varelli's private fan club for exclusive photos, videos, and direct messages. New content weekly. Subscribe now for instant access." />
          <link rel="canonical" href="https://sofiavarelli.com/" />
        </Helmet>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Hero card */}
          <div style={{
            position: "relative", borderRadius: 16, overflow: "hidden",
            minHeight: 320, background: "#111",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.92) 35%, rgba(0,0,0,0.15) 100%)",
              zIndex: 1,
            }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 24px", zIndex: 2 }}>
              <div style={{ color: "#aaa", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>WELCOME TO</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginBottom: 10,
                margin: 0,
              }}>
                Sofia's<br /><span style={{ fontStyle: "italic", color: PINK }}>Private World</span>
              </h1>
              <p style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
                Exclusive content. Real connection. Be part of my inner circle.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                {[["🔒","Exclusive Photos & Videos"],["💬","Direct Messages"],["🎬","Behind the Scenes"],["⭐","New Content Weekly"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11 }}>{icon}</span>
                    <span style={{ color: "#ccc", fontSize: 11 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photo grid preview */}
          <div>
            <div style={{ color: "#888", fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>FREE PREVIEW</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 12 }}>
              {preview.length === 0
                ? Array(6).fill(null).map((_, i) => (
                    <div key={i} style={{
                      aspectRatio: "3/4", borderRadius: 8,
                      background: i < 3 ? "#2a2a2a" : "#1a1a1a",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {i >= 3 && <span style={{ fontSize: 18, opacity: 0.3 }}>🔒</span>}
                    </div>
                  ))
                : preview.map(photo => {
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
                            <img src={imgUrl} alt="" style={{
                              width: "100%", height: "100%", objectFit: "cover",
                              filter: isLocked ? "blur(3px)" : "none",
                            }} />
                            {isLocked && (
                              <div style={{
                                position: "absolute", inset: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "rgba(0,0,0,0.3)",
                              }}>
                                <span style={{ fontSize: 20 }}>🔒</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 20, opacity: 0.3 }}>🔒</span>
                          </div>
                        )}
                      </div>
                    );
                  })
              }
            </div>
            <button onClick={handleJoin} style={{
              width: "100%", background: `linear-gradient(135deg, ${PINK}, #c73460)`,
              border: "none", borderRadius: 12, padding: "15px",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              letterSpacing: 1, fontFamily: "inherit",
            }}>🔒 UNLOCK ALL PHOTOS & VIDEOS</button>
          </div>

          {/* Join panel */}
          <JoinPanel
            fan={fan}
            isSubscribed={isSubscribed}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            setShowAuth={setShowAuth}
            setShowSub={setShowSub}
            inputStyle={inputStyle}
            compact
          />

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: "#111", borderRadius: 12, padding: "16px 14px",
                border: `1px solid ${BORDER}`, textAlign: "center",
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>{f.title}</div>
                <div style={{ color: "#666", fontSize: 11, lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* FAQ Section (visible) */}
          <div style={{ marginTop: 20 }}>
            <h2 style={{ color: "#fff", fontSize: 18, marginBottom: 12 }}>Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><strong style={{ color: PINK }}>What kind of content does Sofia post?</strong><br />Exclusive photos, videos, behind‑the‑scenes, and personal messages.</div>
              <div><strong style={{ color: PINK }}>How do I subscribe?</strong><br />Click "JOIN SOFIA", choose a plan, and pay securely via CCBill.</div>
              <div><strong style={{ color: PINK }}>Can I cancel my subscription?</strong><br />Yes, from your account settings. Cancellation takes effect at the end of the billing period.</div>
            </div>
          </div>

          {/* Author Bio */}
          <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "16px", marginTop: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>S</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700 }}>Sofia Varelli</div>
                <div style={{ color: "#888", fontSize: 12 }}>Creator & Founder</div>
                <div style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>Real, authentic content. I love connecting with my fans.</div>
              </div>
            </div>
          </div>

          {/* Last updated */}
          <div style={{ textAlign: "center", color: "#555", fontSize: 11, marginTop: 10 }}>
            <time dateTime="2026-06-03">Last updated: June 3, 2026</time>
          </div>

          {showAuth && <AuthModal mode="signup" selectedPlan={selectedPlan} onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setShowSub(true); }} />}
          {showSub && <SubscriptionModal onClose={() => setShowSub(false)} onLogin={() => { setShowSub(false); setShowAuth(true); }} />}
        </div>
      </>
    );
  }

  // ── TABLET LAYOUT (2-col) ──
  if (isTablet) {
    return (
      <>
        <Helmet>
          <title>Sofia Varelli – Official Fan Site</title>
          <meta name="description" content="Exclusive content from Sofia Varelli. Join now for photos, videos, and direct messages." />
          <link rel="canonical" href="https://sofiavarelli.com/" />
        </Helmet>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Hero */}
            <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 380, background: "#111" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.2) 100%)", zIndex: 1 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px", zIndex: 2 }}>
                <div style={{ color: "#aaa", fontSize: 9, letterSpacing: 3, marginBottom: 4 }}>WELCOME TO</div>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 30, fontWeight: 700, lineHeight: 1.1, marginBottom: 10,
                  margin: 0,
                }}>
                  Sofia's<br /><span style={{ fontStyle: "italic", color: PINK }}>Private World</span>
                </h1>
                <p style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>
                  Exclusive content. Real connection. Be part of my inner circle.
                </p>
                {[["🔒","Exclusive Photos & Videos"],["💬","Direct Messages"],["🎬","Behind the Scenes"],["⭐","New Content Weekly"],["🎁","Special Offers"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12 }}>{icon}</span>
                    <span style={{ color: "#ccc", fontSize: 12 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Join panel */}
            <JoinPanel
              fan={fan}
              isSubscribed={isSubscribed}
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              setShowAuth={setShowAuth}
              setShowSub={setShowSub}
              inputStyle={inputStyle}
            />
          </div>

          {/* Photo preview full-width */}
          <div>
            <div style={{ color: "#888", fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>FREE PREVIEW</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 14 }}>
              {preview.length === 0
                ? Array(6).fill(null).map((_, i) => (
                    <div key={i} style={{ aspectRatio: "3/4", borderRadius: 8, background: i < 3 ? "#2a2a2a" : "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i >= 3 && <span style={{ fontSize: 18, opacity: 0.3 }}>🔒</span>}
                    </div>
                  ))
                : preview.map(photo => {
                    const accessible = hasAccess(photo);
                    const imgUrl = imageUrls[photo.id];
                    return (
                      <div key={photo.id} style={{ aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", position: "relative", background: "#1a1a1a" }}>
                        {imgUrl && <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: !accessible ? "blur(3px)" : "none" }} />}
                        {!accessible && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 18 }}>🔒</span></div>}
                      </div>
                    );
                  })
              }
            </div>
            <button onClick={handleJoin} style={{
              width: "100%", background: "transparent", border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: "13px", color: "#fff", fontSize: 12, fontWeight: 700,
              cursor: "pointer", letterSpacing: 1, fontFamily: "inherit",
            }}>🔒 UNLOCK ALL PHOTOS & VIDEOS</button>
          </div>

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#111", borderRadius: 12, padding: "18px 14px", border: `1px solid ${BORDER}`, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 7 }}>{f.icon}</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 9, letterSpacing: 1, marginBottom: 5 }}>{f.title}</div>
                <div style={{ color: "#666", fontSize: 11, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ color: "#fff", fontSize: 22, marginBottom: 16 }}>Frequently Asked Questions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><strong style={{ color: PINK }}>What content does Sofia post?</strong><br />Exclusive photos, videos, BTS, and personal messages.</div>
              <div><strong style={{ color: PINK }}>How do I subscribe?</strong><br />Click JOIN SOFIA, choose a plan, pay with CCBill.</div>
              <div><strong style={{ color: PINK }}>Can I cancel?</strong><br />Yes, from account settings. No refunds for partial months.</div>
              <div><strong style={{ color: PINK }}>Is my payment secure?</strong><br />Yes, CCBill is PCI compliant.</div>
            </div>
          </div>

          {/* Author Bio */}
          <div style={{ background: "#1a1a1a", borderRadius: 16, padding: "20px", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>S</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Sofia Varelli</div>
              <div style={{ color: "#888", fontSize: 12 }}>Creator</div>
              <div style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>Real, authentic content. I reply to messages personally.</div>
            </div>
          </div>

          {/* Last updated */}
          <div style={{ textAlign: "center", color: "#555", fontSize: 11, marginTop: 8 }}>
            <time dateTime="2026-06-03">Last updated: June 3, 2026</time>
          </div>

          {showAuth && <AuthModal mode="signup" selectedPlan={selectedPlan} onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setShowSub(true); }} />}
          {showSub && <SubscriptionModal onClose={() => setShowSub(false)} onLogin={() => { setShowSub(false); setShowAuth(true); }} />}
        </div>
      </>
    );
  }

  // ── DESKTOP LAYOUT (3-col) ──
  return (
    <>
      <Helmet>
        <title>Sofia Varelli – Official Fan Site | Exclusive Content</title>
        <meta name="description" content="Join Sofia Varelli's private fan club for exclusive photos, videos, and direct messages. New content weekly. Subscribe now for instant access." />
        <meta property="og:title" content="Sofia Varelli – Official Fan Site" />
        <meta property="og:description" content="Exclusive photos, videos, and direct messages from Sofia Varelli. Join now." />
        <meta property="og:url" content="https://sofiavarelli.com/" />
        <link rel="canonical" href="https://sofiavarelli.com/" />
      </Helmet>
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, alignItems: "start" }}>
          {/* LEFT — Hero */}
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 440, background: "#111" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.2) 100%)", zIndex: 1 }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 28, zIndex: 2 }}>
              <div style={{ color: "#aaa", fontSize: 10, letterSpacing: 3, marginBottom: 4 }}>WELCOME TO</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36, fontWeight: 700, lineHeight: 1.1, marginBottom: 12,
                margin: 0,
              }}>
                Sofia's<br /><span style={{ fontStyle: "italic", color: PINK }}>Private World</span>
              </h1>
              <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                Exclusive content. Real connection. Be part of my inner circle.
              </p>
              {[["🔒","Exclusive Photos & Videos"],["💬","Direct Messages"],["🎬","Behind the Scenes"],["⭐","New Content Weekly"],["🎁","Special Offers & Discounts"]].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span style={{ color: "#ccc", fontSize: 13 }}>{text}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex" }}>
                  {["#c73460","#8B2FC9","#2F80ED","#F2994A"].map((bg, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: bg, border: "2px solid #0D0D0D", marginLeft: i ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                      {["A","J","M","L"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>10,000+ Members</div>
                  <div style={{ color: "#888", fontSize: 11 }}>Join thousands of fans</div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE — Photo grid */}
          <div>
            <div style={{ color: "#888", fontSize: 11, letterSpacing: 2, marginBottom: 14 }}>FREE PREVIEW</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
              {preview.length === 0
                ? Array(6).fill(null).map((_, i) => (
                    <div key={i} style={{ aspectRatio: "3/4", borderRadius: 8, background: i < 3 ? "#2a2a2a" : "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i >= 3 && <span style={{ fontSize: 20, opacity: 0.4 }}>🔒</span>}
                    </div>
                  ))
                : preview.map(photo => {
                    const accessible = hasAccess(photo);
                    const imgUrl = imageUrls[photo.id];
                    return (
                      <div key={photo.id} style={{ aspectRatio: "3/4", borderRadius: 8, overflow: "hidden", position: "relative", background: "#1a1a1a" }}>
                        {imgUrl && <img src={imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: !accessible ? "blur(3px)" : "none" }} />}
                        {!accessible && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}><span style={{ fontSize: 20 }}>🔒</span></div>}
                      </div>
                    );
                  })
              }
            </div>
            <button onClick={handleJoin} style={{
              width: "100%", background: "transparent", border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: "14px", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: 1, fontFamily: "inherit",
            }}>🔒 UNLOCK ALL PHOTOS & VIDEOS</button>
          </div>

          {/* RIGHT — Join panel */}
          <JoinPanel
            fan={fan}
            isSubscribed={isSubscribed}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            setShowAuth={setShowAuth}
            setShowSub={setShowSub}
            inputStyle={inputStyle}
          />
        </div>

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 28 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: "#111", borderRadius: 12, padding: "20px 16px", border: `1px solid ${BORDER}`, textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>{f.title}</div>
              <div style={{ color: "#666", fontSize: 12, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Callout box */}
        <div style={{ marginTop: 24, background: "rgba(232,84,122,0.1)", borderLeft: `4px solid ${PINK}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontWeight: 700, color: PINK, marginBottom: 4 }}>🔥 New content every week</div>
          <div style={{ color: "#ccc" }}>Subscribe now and never miss an update. Fresh photos and videos added weekly.</div>
        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ color: "#fff", fontSize: 24, marginBottom: 20 }}>Frequently Asked Questions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            <div>
              <div style={{ color: PINK, fontWeight: 700, marginBottom: 6 }}>What kind of content does Sofia post?</div>
              <div style={{ color: "#ccc", lineHeight: 1.5 }}>Exclusive photos, videos, behind‑the‑scenes content, and personal messages. New content added weekly.</div>
            </div>
            <div>
              <div style={{ color: PINK, fontWeight: 700, marginBottom: 6 }}>How do I subscribe?</div>
              <div style={{ color: "#ccc", lineHeight: 1.5 }}>Click the "JOIN SOFIA" button, choose a plan (monthly, 3‑month, or 6‑month), and complete payment securely via CCBill.</div>
            </div>
            <div>
              <div style={{ color: PINK, fontWeight: 700, marginBottom: 6 }}>Can I cancel my subscription?</div>
              <div style={{ color: "#ccc", lineHeight: 1.5 }}>Yes, you can cancel at any time from your account settings. Cancellations take effect at the end of the current billing period.</div>
            </div>
            <div>
              <div style={{ color: PINK, fontWeight: 700, marginBottom: 6 }}>Is my payment information secure?</div>
              <div style={{ color: "#ccc", lineHeight: 1.5 }}>All payments are processed by CCBill, a PCI‑compliant processor. We do not store your credit card details.</div>
            </div>
          </div>
        </div>

        {/* Author Bio */}
        <div style={{ marginTop: 32, background: "#1a1a1a", borderRadius: 20, padding: "24px", display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 }}>S</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>Sofia Varelli</div>
            <div style={{ color: "#888", marginBottom: 8 }}>Creator & Founder</div>
            <div style={{ color: "#aaa", lineHeight: 1.6 }}>I'm Sofia – a real creator sharing my world with you. All content is authentic, produced by me, and uploaded only by me. I love connecting with my fans, so don't hesitate to send a message.</div>
          </div>
        </div>

        {/* Last updated */}
        <div style={{ textAlign: "center", color: "#555", fontSize: 12, marginTop: 32 }}>
          <time dateTime="2026-06-03">Last updated: June 3, 2026</time>
        </div>

        {showAuth && <AuthModal mode="signup" selectedPlan={selectedPlan} onClose={() => setShowAuth(false)} onSuccess={() => { setShowAuth(false); setShowSub(true); }} />}
        {showSub && <SubscriptionModal onClose={() => setShowSub(false)} onLogin={() => { setShowSub(false); setShowAuth(true); }} />}
      </div>
    </>
  );
}

// ── SHARED JOIN PANEL COMPONENT ──
function JoinPanel({ fan, isSubscribed, selectedPlan, setSelectedPlan, setShowAuth, setShowSub, inputStyle, compact }) {
  const [form, setForm] = useState({ name: "", email: "" });

  return (
    <div style={{
      background: "#111", borderRadius: 16,
      padding: compact ? "20px 16px" : "28px 22px",
      border: `1px solid ${BORDER}`,
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: compact ? 18 : 21,
        fontWeight: 700, textAlign: "center", marginBottom: 4, color: "#fff",
      }}>
        JOIN SOFIA <span style={{ color: PINK }}>♥</span>
      </div>
      <div style={{ color: "#888", fontSize: 11, textAlign: "center", marginBottom: compact ? 18 : 22, letterSpacing: 1 }}>
        GET FULL ACCESS TO MY EXCLUSIVE CONTENT
      </div>

      {fan ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          {isSubscribed ? (
            <div style={{ color: PINK, fontWeight: 700, fontSize: 14 }}>✓ You're a member! Enjoy all content.</div>
          ) : (
            <>
              <div style={{ color: "#888", marginBottom: 16, fontSize: 13 }}>
                Welcome back!<br />Choose a plan below.
              </div>
              <PlanSelector plans={PLANS} selected={selectedPlan} onSelect={setSelectedPlan} />
              <button onClick={() => setShowSub(true)} style={{
                width: "100%", background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                border: "none", borderRadius: 12, padding: "15px",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                letterSpacing: 1, fontFamily: "inherit",
              }}>🔒 JOIN NOW</button>
            </>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <input placeholder="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle} />
            <input type="email" placeholder="Email Address" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle} />
            <div style={{
              background: "rgba(34,197,94,0.06)", border: `1px solid rgba(34,197,94,0.2)`,
              borderRadius: 10, padding: "11px 14px", display: "flex", gap: 10, alignItems: "center",
            }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>Password is auto-generated</div>
                <div style={{ color: "#666", fontSize: 10 }}>A secure password will be sent to your email</div>
              </div>
            </div>
          </div>

          <div style={{ color: "#888", fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>CHOOSE YOUR PLAN</div>
          <PlanSelector plans={PLANS} selected={selectedPlan} onSelect={setSelectedPlan} compact={compact} />

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer" }}>
            <div style={{ width: 36, height: 20, background: "#333", borderRadius: 10, position: "relative", flexShrink: 0 }}>
              <div style={{ width: 14, height: 14, background: "#666", borderRadius: "50%", position: "absolute", top: 3, left: 3 }} />
            </div>
            <span style={{ color: "#666", fontSize: 10 }}>
              I agree to the <span style={{ color: PINK }}>Terms of Use</span> and confirm I am 18+
            </span>
          </label>

          <button onClick={() => setShowAuth(true)} style={{
            width: "100%", background: `linear-gradient(135deg, ${PINK}, #c73460)`,
            border: "none", borderRadius: 12, padding: "15px",
            color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
            letterSpacing: 1, fontFamily: "inherit", marginBottom: 8,
          }}>🔒 JOIN NOW</button>
          <div style={{ textAlign: "center", color: "#555", fontSize: 10 }}>🔒 SECURE &amp; DISCREET</div>
        </>
      )}
    </div>
  );
}

function PlanSelector({ plans, selected, onSelect, compact }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 8, marginBottom: compact ? 14 : 16 }}>
      {plans.map((p) => (
        <div key={p.id} onClick={() => onSelect(p.id)} style={{
          border: `2px solid ${selected === p.id ? PINK : BORDER}`,
          borderRadius: 10, padding: compact ? "10px 12px" : "12px 14px",
          cursor: "pointer",
          background: selected === p.id ? "rgba(232,84,122,0.08)" : "#1a1a1a",
          position: "relative", transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {p.badge && (
            <div style={{
              position: "absolute", top: -9, right: 10,
              background: PINK, borderRadius: 5, padding: "2px 7px",
              fontSize: 8, fontWeight: 700, color: "#fff", letterSpacing: 0.5,
            }}>{p.badge}</div>
          )}
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            border: `2px solid ${selected === p.id ? PINK : "#444"}`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {selected === p.id && <div style={{ width: 7, height: 7, borderRadius: "50%", background: PINK }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: compact ? 12 : 13 }}>{p.label}</div>
            <div style={{ color: "#777", fontSize: 10 }}>{p.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}