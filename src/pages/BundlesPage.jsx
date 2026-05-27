// src/pages/BundlesPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { bundleHelpers, contentHelpers } from "../lib/supabase";
import { BundleModal } from "../components/PaymentModal";
import { AuthModal } from "../components/AuthModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

export function BundlesPage() {
  const { fan } = useAuth();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState([]);

  useEffect(() => {
    bundleHelpers.getAll().then(setBundles).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!fan || !bundles.length) return;
    Promise.all(bundles.map((b) => bundleHelpers.hasPurchased(fan.id, b.id))).then((results) => {
      setPurchasedIds(bundles.filter((_, i) => results[i]).map((b) => b.id));
    });
  }, [fan, bundles]);

  function handleBuy(bundle) {
    if (!fan) { setShowAuth(true); return; }
    setSelected(bundle);
  }

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#555" }}>Loading bundles...</div>;

  if (bundles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#fff", marginBottom: 8 }}>
          Special Bundles Coming Soon
        </div>
        <div style={{ color: "#888" }}>Sofia is preparing exclusive content bundles for you.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#fff", marginBottom: 8 }}>
          Exclusive Bundles <span style={{ color: PINK }}>🎁</span>
        </div>
        <div style={{ color: "#888" }}>Special collections at discounted prices — for a limited time</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {bundles.map((bundle) => {
          const owned = purchasedIds.includes(bundle.id);
          const savings = bundle.original_price
            ? Math.round(((bundle.original_price - bundle.price) / bundle.original_price) * 100)
            : null;
          const itemCount = bundle.bundle_items?.length || 0;

          return (
            <div key={bundle.id} style={{
              background: "#111", borderRadius: 16, overflow: "hidden",
              border: `1px solid ${owned ? PINK : BORDER}`,
              transition: "border-color 0.2s",
            }}>
              {/* Thumbnail */}
              <div style={{ aspectRatio: "16/9", background: "#1a1a1a", position: "relative" }}>
                {bundle.thumbnail_path && (
                  <img
                    src={contentHelpers.getPublicUrl("thumbnails", bundle.thumbnail_path)}
                    alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                {savings && !owned && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: PINK, borderRadius: 8, padding: "4px 10px",
                    color: "#fff", fontWeight: 800, fontSize: 13,
                  }}>SAVE {savings}%</div>
                )}
                {owned && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    background: "#22c55e", borderRadius: 8, padding: "4px 10px",
                    color: "#fff", fontWeight: 700, fontSize: 12,
                  }}>✓ OWNED</div>
                )}
                {bundle.expires_at && !owned && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
                    padding: "20px 12px 10px",
                    color: "#ff8080", fontSize: 11, fontWeight: 700,
                  }}>
                    ⏳ Expires {new Date(bundle.expires_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "18px" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {bundle.title}
                </div>
                <div style={{ color: "#888", fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  {bundle.description}
                </div>
                <div style={{ color: "#666", fontSize: 12, marginBottom: 16 }}>
                  {itemCount} items included
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: PINK, fontSize: 22, fontWeight: 800 }}>
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
                      border: "none", borderRadius: 10, padding: "10px 20px",
                      color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                    }}>
                      Buy Bundle
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <BundleModal bundle={selected} onClose={() => setSelected(null)} />}
      {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </div>
  );
}