// src/pages/BundlesPage.jsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { bundleHelpers, contentHelpers } from "../lib/supabase";
import { BundleModal } from "../components/PaymentModal";
import { AuthModal } from "../components/AuthModal";

const PINK = "#E8547A";
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

export function BundlesPage() {
  const { fan } = useAuth();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const w = useWindowSize();
  const isMobile = w < 640;

  useEffect(() => {
    bundleHelpers.getAll().then(setBundles).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!fan || !bundles.length) return;
    Promise.all(bundles.map(b => bundleHelpers.hasPurchased(fan.id, b.id))).then(results => {
      setPurchasedIds(bundles.filter((_, i) => results[i]).map(b => b.id));
    });
  }, [fan, bundles]);

  function handleBuy(bundle) {
    if (!fan) { setShowAuth(true); return; }
    setSelected(bundle);
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>✦</div>
        Loading bundles...
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <>
        <Helmet>
          <title>Bundles – Sofia Varelli | Discounted Content Packs</title>
          <meta name="description" content="Save money with exclusive content bundles from Sofia Varelli. Limited time offers on photo and video packs." />
          <link rel="canonical" href="https://sofiavarelli.com/bundles" />
        </Helmet>
        <div style={{ textAlign: "center", padding: isMobile ? "50px 20px" : "80px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, color: "#fff", marginBottom: 8 }}>
            Special Bundles Coming Soon
          </div>
          <div style={{ color: "#888", fontSize: 13 }}>Sofia is preparing exclusive content bundles for you.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bundles – Sofia Varelli | Discounted Content Packs</title>
        <meta name="description" content="Save money with exclusive content bundles from Sofia Varelli. Limited time offers on photo and video packs." />
        <link rel="canonical" href="https://sofiavarelli.com/bundles" />
      </Helmet>
      <div>
        {/* Page Heading */}
        <h1 style={{ fontSize: isMobile ? 28 : 36, color: "#fff", textAlign: "center", marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
          Premium Bundles <span style={{ color: PINK }}>🎁</span>
        </h1>

        <div style={{ marginBottom: isMobile ? 20 : 28, textAlign: "center", padding: isMobile ? "0 10px" : 0 }}>
          <div style={{ color: "#888", fontSize: isMobile ? 12 : 13, lineHeight: 1.6 }}>
            Special collections at discounted prices — for a limited time
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
          gap: isMobile ? 14 : 20,
        }}>
          {bundles.map(bundle => {
            const owned = purchasedIds.includes(bundle.id);
            const savings = bundle.original_price
              ? Math.round(((bundle.original_price - bundle.price) / bundle.original_price) * 100)
              : null;
            const itemCount = bundle.bundle_items?.length || 0;

            return (
              <div key={bundle.id} style={{
                background: "#111", borderRadius: 16, overflow: "hidden",
                border: `1px solid ${owned ? PINK : BORDER}`,
                transition: "border-color 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => !isMobile && (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => !isMobile && (e.currentTarget.style.transform = "none")}
              >
                {/* Thumbnail */}
                <div style={{ aspectRatio: "16/9", background: "#1a1a1a", position: "relative" }}>
                  {bundle.thumbnail_path && (
                    <img
                      src={contentHelpers.getPublicUrl("thumbnails", bundle.thumbnail_path)}
                      alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)",
                  }} />
                  {savings && !owned && (
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      background: PINK, borderRadius: 8, padding: "4px 10px",
                      color: "#fff", fontWeight: 800, fontSize: 12,
                    }}>SAVE {savings}%</div>
                  )}
                  {owned && (
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      background: "#22c55e", borderRadius: 8, padding: "4px 10px",
                      color: "#fff", fontWeight: 700, fontSize: 11,
                    }}>✓ OWNED</div>
                  )}
                  {bundle.expires_at && !owned && (
                    <div style={{
                      position: "absolute", bottom: 10, left: 10,
                      color: "#ff8080", fontSize: 11, fontWeight: 600,
                    }}>⏳ Expires {new Date(bundle.expires_at).toLocaleDateString()}</div>
                  )}
                  {!bundle.thumbnail_path && (
                    <div style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 48, opacity: 0.15,
                    }}>🎁</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: isMobile ? "14px" : "18px" }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? 14 : 16, marginBottom: 4 }}>
                    {bundle.title}
                  </div>
                  <div style={{ color: "#888", fontSize: isMobile ? 12 : 13, marginBottom: 12, lineHeight: 1.5 }}>
                    {bundle.description}
                  </div>
                  <div style={{ color: "#666", fontSize: 11, marginBottom: 14 }}>
                    {itemCount} items included
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 10,
                  }}>
                    <div>
                      <div style={{ color: PINK, fontSize: isMobile ? 20 : 22, fontWeight: 800 }}>
                        ${bundle.price?.toFixed(2)}
                      </div>
                      {bundle.original_price && (
                        <div style={{ color: "#555", fontSize: 12, textDecoration: "line-through" }}>
                          ${bundle.original_price?.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {owned ? (
                      <div style={{ color: "#22c55e", fontSize: 13, fontWeight: 700 }}>✓ Access Granted</div>
                    ) : (
                      <button onClick={() => handleBuy(bundle)} style={{
                        background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                        border: "none", borderRadius: 10,
                        padding: isMobile ? "10px 18px" : "11px 22px",
                        color: "#fff", fontWeight: 700, cursor: "pointer",
                        fontSize: isMobile ? 12 : 13, fontFamily: "inherit",
                        whiteSpace: "nowrap",
                      }}>Buy Bundle</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Author Bio */}
        <div style={{ marginTop: 50, background: "#1a1a1a", borderRadius: 16, padding: "20px", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>S</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Sofia Varelli</div>
            <div style={{ color: "#888", fontSize: 12 }}>Creator</div>
            <div style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>Bundles are hand‑picked by me to give you the best value.</div>
          </div>
        </div>

        {/* Last updated */}
        <div style={{ textAlign: "center", color: "#555", fontSize: 11, marginTop: 24 }}>
          <time dateTime="2026-06-03">Last updated: June 3, 2026</time>
        </div>

        {selected && <BundleModal bundle={selected} onClose={() => setSelected(null)} />}
        {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      </div>
    </>
  );
}