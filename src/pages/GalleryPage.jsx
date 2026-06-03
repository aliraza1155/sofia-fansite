// src/pages/GalleryPage.jsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { contentHelpers } from "../lib/supabase";
import { SubscriptionModal, PPVModal, TipModal } from "../components/PaymentModal";
import { AuthModal } from "../components/AuthModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";
const CATS = ["All Photos", "Lingerie", "Bikini", "Behind the Scenes", "Personal", "Favorites"];

function useWindowSize() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

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
  const w = useWindowSize();
  const isMobile = w < 640;
  const isTablet = w < 1024;

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

  const cols = isMobile ? 3 : isTablet ? 3 : 4;
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: isMobile ? 5 : 8,
    marginBottom: 16,
  };

  return (
    <>
      <Helmet>
        <title>Sofia Varelli – Photo Gallery | Exclusive Members-Only Content</title>
        <meta name="description" content="Browse exclusive photos from Sofia Varelli. New images added weekly. Join now for full access to the private gallery." />
        <link rel="canonical" href="https://sofiavarelli.com/gallery" />
      </Helmet>
      <div>
        {/* Category tabs — horizontal scroll on mobile, sidebar on desktop */}
        {isMobile || isTablet ? (
          <div style={{
            display: "flex", gap: 6, marginBottom: 16,
            overflowX: "auto", paddingBottom: 4,
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
            <style>{`::-webkit-scrollbar { display: none; }`}</style>
            {CATS.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                flexShrink: 0, padding: isMobile ? "7px 12px" : "8px 16px",
                borderRadius: 20, border: "none",
                background: category === cat ? PINK : "#1a1a1a",
                color: category === cat ? "#fff" : "#888",
                fontSize: isMobile ? 11 : 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}>{cat}</button>
            ))}
          </div>
        ) : null}

        <div style={{ display: isTablet ? "block" : "grid", gridTemplateColumns: "160px 1fr", gap: 24 }}>
          {/* Sidebar — desktop only */}
          {!isTablet && (
            <div>
              <div style={{ color: "#888", fontSize: 10, letterSpacing: 2, marginBottom: 14 }}>GALLERY</div>
              {CATS.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} style={{
                  display: "block", width: "100%", textAlign: "left", border: "none",
                  padding: "9px 12px", borderRadius: 8,
                  color: category === cat ? "#fff" : "#888",
                  background: category === cat ? "rgba(232,84,122,0.1)" : "transparent",
                  cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                  borderLeft: `3px solid ${category === cat ? PINK : "transparent"}`,
                  marginBottom: 2, transition: "all 0.15s",
                }}>{cat}</button>
              ))}
            </div>
          )}

          {/* Main content */}
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: isMobile ? 12 : 18,
            }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>
                {category.toUpperCase()}
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {["Newest", "Popular", "A-Z"].map(s => (
                  <button key={s} onClick={() => setSort(s)} style={{
                    padding: isMobile ? "5px 10px" : "6px 13px",
                    borderRadius: 8, border: "none", cursor: "pointer",
                    background: sort === s ? PINK : "#1a1a1a", color: "#fff",
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: sort === s ? 700 : 400, fontFamily: "inherit",
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#555" }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>◻</div>
                Loading...
              </div>
            ) : (
              <div style={gridStyle}>
                {photos.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "#555" }}>
                    <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>◻</div>
                    No photos yet in this category.
                  </div>
                )}
                {photos.map(photo => {
                  const accessible = hasAccess(photo);
                  const imgUrl = imageUrls[photo.id];
                  const isLocked = !accessible;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => handlePhotoClick(photo)}
                      style={{
                        aspectRatio: "3/4", borderRadius: isMobile ? 8 : 10,
                        overflow: "hidden", cursor: "pointer", position: "relative",
                        background: "#1a1a1a", transition: "transform 0.15s",
                      }}
                      onMouseEnter={e => !isMobile && (e.currentTarget.style.transform = "scale(1.02)")}
                      onMouseLeave={e => !isMobile && (e.currentTarget.style.transform = "scale(1)")}
                    >
                      {imgUrl ? (
                        <>
                          <img src={imgUrl} alt="" style={{
                            width: "100%", height: "100%", objectFit: "cover",
                            filter: isLocked ? "blur(4px) brightness(0.7)" : "none",
                          }} />
                          {isLocked && (
                            <div style={{
                              position: "absolute", inset: 0,
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center", gap: 4,
                              background: "rgba(0,0,0,0.2)",
                            }}>
                              <span style={{ fontSize: isMobile ? 18 : 22 }}>🔒</span>
                              {photo.ppv_price && (
                                <div style={{
                                  background: PINK, borderRadius: 6, padding: "2px 7px",
                                  color: "#fff", fontSize: 10, fontWeight: 700,
                                }}>${photo.ppv_price}</div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}>
                          <span style={{ fontSize: 24, opacity: 0.3 }}>🔒</span>
                        </div>
                      )}

                      {/* Tip button on hover (desktop) */}
                      {accessible && !isMobile && (
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                          padding: "20px 8px 8px",
                          opacity: 0, transition: "opacity 0.2s",
                          display: "flex", justifyContent: "flex-end",
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                        >
                          <button onClick={(e) => { e.stopPropagation(); setShowTip(photo.id); }} style={{
                            background: "rgba(245,166,35,0.85)", border: "none",
                            borderRadius: 8, padding: "5px 10px",
                            color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700,
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
              padding: isMobile ? "13px" : "14px", color: "#fff",
              fontSize: isMobile ? 12 : 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: 1, fontFamily: "inherit",
            }}>🔒 UNLOCK ALL PHOTOS</button>
          </div>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
              padding: isMobile ? 10 : 20,
            }}
          >
            <button onClick={() => setLightbox(null)} style={{
              position: "absolute", top: isMobile ? 12 : 20, right: isMobile ? 12 : 20,
              background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
              fontSize: 20, cursor: "pointer", borderRadius: "50%",
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
            <img
              src={lightbox.url} alt=""
              style={{ maxHeight: "88vh", maxWidth: "92vw", borderRadius: 12, objectFit: "contain" }}
              onClick={e => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); setShowTip(lightbox.item.id); }} style={{
              position: "absolute", bottom: isMobile ? 16 : 28, right: isMobile ? 16 : 28,
              background: "rgba(245,166,35,0.15)", border: "1px solid #f5a623",
              borderRadius: 12, padding: isMobile ? "8px 16px" : "10px 20px",
              color: "#f5a623", fontWeight: 700, cursor: "pointer",
              fontSize: isMobile ? 12 : 14, fontFamily: "inherit",
            }}>💛 Send Tip</button>
          </div>
        )}

        {selectedPPV && <PPVModal content={selectedPPV} onClose={() => setSelectedPPV(null)} />}
        {showSub && <SubscriptionModal onClose={() => setShowSub(false)} onLogin={() => { setShowSub(false); setShowAuth(true); }} />}
        {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
        {showTip && <TipModal contentId={showTip} onClose={() => setShowTip(null)} />}
      </div>
    </>
  );
}