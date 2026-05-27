// src/pages/GalleryPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { contentHelpers } from "../lib/supabase";
import { SubscriptionModal, PPVModal, TipModal } from "../components/PaymentModal";
import { AuthModal } from "../components/AuthModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";
const CATS = ["All Photos", "Lingerie", "Bikini", "Behind the Scenes", "Personal", "Favorites"];

export function GalleryPage() {
  const { fan, hasAccess } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [category, setCategory] = useState("All Photos");
  const [sort, setSort] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [selectedPPV, setSelectedPPV] = useState(null);
  const [showSub, setShowSub] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showTip, setShowTip] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const data = await contentHelpers.getAll("photo", category);
        setPhotos(data);
        const urls = {};
        for (const photo of data) {
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
        console.error("Error fetching photos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [category, hasAccess]);

  function handleLockClick(photo) {
    if (!fan) { setShowAuth(true); return; }
    if (photo.ppv_price) { setSelectedPPV(photo); return; }
    setShowSub(true);
  }

  async function handlePhotoClick(photo) {
    if (!hasAccess(photo)) { handleLockClick(photo); return; }
    const url = contentHelpers.getPublicUrl("content", photo.storage_path);
    setLightbox({ url, item: photo });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24 }}>
      {/* Sidebar */}
      <div>
        <div style={{ color: "#888", fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>GALLERY</div>
        {CATS.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
            padding: "10px 14px", borderRadius: 8, color: category === cat ? "#fff" : "#888",
            background: category === cat ? "rgba(232,84,122,0.1)" : "transparent", cursor: "pointer",
            fontSize: 13, fontFamily: "inherit", borderLeft: `3px solid ${category === cat ? PINK : "transparent"}`,
            marginBottom: 2,
          }}>{cat}</button>
        ))}
      </div>

      {/* Main content */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>ALL PHOTOS</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Newest", "Popular", "A - Z"].map(s => (
              <button key={s} onClick={() => setSort(s)} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: sort === s ? PINK : "#1a1a1a", color: "#fff", fontSize: 12,
                fontWeight: sort === s ? 700 : 400, fontFamily: "inherit",
              }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#555" }}>Loading...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
            {photos.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#555" }}>No photos yet.</div>
            )}
            {photos.map(photo => {
              const accessible = hasAccess(photo);
              const imgUrl = imageUrls[photo.id];
              const isLocked = !accessible;
              return (
                <div key={photo.id} onClick={() => handlePhotoClick(photo)} style={{
  aspectRatio: "3/4", borderRadius: 10, overflow: "hidden", cursor: "pointer",
  position: "relative", transition: "transform 0.2s",
  background: accessible ? "transparent" : "#1a1a1a",
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
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}>
                      <span style={{ fontSize: 24 }}>🖼️</span>
                    </div>
                  )}
                  {accessible && (
                    <div style={{ position: "absolute", bottom: 8, right: 8, opacity: 0, transition: "opacity 0.2s" }} className="tip-btn">
                      <button onClick={(e) => { e.stopPropagation(); setShowTip(photo.id); }} style={{
                        background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 8, padding: "4px 8px",
                        color: "#f5a623", cursor: "pointer", fontSize: 12,
                      }}>💛 Tip</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => setShowSub(true)} style={{
          width: "100%", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10,
          padding: "14px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 1,
        }}>🔒 UNLOCK ALL PHOTOS</button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 999,
        }}>
          <button onClick={() => setLightbox(null)} style={{
            position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer",
          }}>✕</button>
          <img src={lightbox.url} alt="" style={{ maxHeight: "90vh", maxWidth: "90vw", borderRadius: 12 }} onClick={e => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setShowTip(lightbox.item.id); }} style={{
            position: "absolute", bottom: 30, right: 30, background: "rgba(245,166,35,0.2)",
            border: "1px solid #f5a623", borderRadius: 12, padding: "10px 20px", color: "#f5a623",
            fontWeight: 700, cursor: "pointer", fontSize: 14,
          }}>💛 Send Tip</button>
        </div>
      )}

      {selectedPPV && <PPVModal content={selectedPPV} onClose={() => setSelectedPPV(null)} />}
      {showSub && <SubscriptionModal onClose={() => setShowSub(false)} onLogin={() => { setShowSub(false); setShowAuth(true); }} />}
      {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      {showTip && <TipModal contentId={showTip} onClose={() => setShowTip(null)} />}
    </div>
  );
}