// src/pages/VideosPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { contentHelpers } from "../lib/supabase";
import { SubscriptionModal, PPVModal, TipModal } from "../components/PaymentModal";
import { AuthModal } from "../components/AuthModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";
const CATS = ["All Videos", "Solo Videos", "Bikini Videos", "Behind the Scenes", "Custom Videos", "Favorites"];

function useWindowSize() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function fmtDuration(s) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideosPage() {
  const { fan, hasAccess } = useAuth();
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState("All Videos");
  const [sort, setSort] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [selectedPPV, setSelectedPPV] = useState(null);
  const [showSub, setShowSub] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showTip, setShowTip] = useState(null);
  const [playing, setPlaying] = useState(null);
  const w = useWindowSize();
  const isMobile = w < 640;
  const isTablet = w < 1024;

  useEffect(() => {
    setLoading(true);
    contentHelpers.getAll("video", category).then((data) => {
      setVideos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [category]);

  async function handleVideoClick(video) {
    if (!hasAccess(video)) {
      if (!fan) { setShowAuth(true); return; }
      if (video.ppv_price) { setSelectedPPV(video); return; }
      setShowSub(true);
      return;
    }
    try {
      const url = await contentHelpers.getSignedUrl(video.storage_path, 7200);
      setPlaying({ url, item: video });
    } catch (e) {
      console.error(e);
    }
  }

  const cols = isMobile ? 2 : isTablet ? 2 : 3;

  return (
    <div>
      {/* Category tabs — horizontal scroll on mobile/tablet */}
      {(isMobile || isTablet) ? (
        <div style={{
          display: "flex", gap: 6, marginBottom: 16,
          overflowX: "auto", paddingBottom: 4,
          scrollbarWidth: "none",
        }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              flexShrink: 0, padding: isMobile ? "7px 12px" : "8px 16px",
              borderRadius: 20, border: "none",
              background: category === cat ? PINK : "#1a1a1a",
              color: category === cat ? "#fff" : "#888",
              fontSize: isMobile ? 11 : 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}>{cat}</button>
          ))}
        </div>
      ) : null}

      <div style={{ display: isTablet ? "block" : "grid", gridTemplateColumns: "160px 1fr", gap: 24 }}>
        {/* Desktop sidebar */}
        {!isTablet && (
          <div>
            <div style={{ color: "#888", fontSize: 10, letterSpacing: 2, marginBottom: 14 }}>VIDEOS</div>
            {CATS.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                display: "block", width: "100%", textAlign: "left",
                background: category === cat ? "rgba(232,84,122,0.1)" : "transparent",
                border: "none", padding: "9px 12px", borderRadius: 8,
                color: category === cat ? "#fff" : "#888",
                cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                borderLeft: `3px solid ${category === cat ? PINK : "transparent"}`,
                marginBottom: 2, transition: "all 0.15s",
              }}>{cat}</button>
            ))}
          </div>
        )}

        <div>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: isMobile ? 12 : 18,
          }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>
              {category.toUpperCase()}
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {["Newest", "Popular", "Longest"].map(s => (
                <button key={s} onClick={() => setSort(s)} style={{
                  padding: isMobile ? "5px 10px" : "6px 12px",
                  borderRadius: 8, border: "none", cursor: "pointer",
                  background: sort === s ? PINK : "#1a1a1a",
                  color: "#fff", fontSize: isMobile ? 10 : 11,
                  fontWeight: sort === s ? 700 : 400, fontFamily: "inherit",
                }}>{s}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px", color: "#555" }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>▷</div>
              Loading...
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: isMobile ? 8 : 12, marginBottom: 16,
            }}>
              {videos.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px 20px", color: "#555" }}>
                  <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>▷</div>
                  No videos yet in this category.
                </div>
              )}
              {videos.map(video => {
                const accessible = hasAccess(video);
                const thumbUrl = video.thumbnail_path
                  ? contentHelpers.getPublicUrl("thumbnails", video.thumbnail_path)
                  : null;
                return (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    style={{
                      borderRadius: isMobile ? 10 : 12, overflow: "hidden",
                      background: "#1a1a1a", cursor: "pointer", position: "relative",
                      transition: "transform 0.15s",
                    }}
                    onMouseEnter={e => !isMobile && (e.currentTarget.style.transform = "scale(1.02)")}
                    onMouseLeave={e => !isMobile && (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <div style={{ aspectRatio: "16/9", position: "relative", background: "#111" }}>
                      {thumbUrl && (
                        <img src={thumbUrl} alt="" style={{
                          width: "100%", height: "100%", objectFit: "cover",
                          filter: accessible ? "none" : "blur(8px) brightness(0.3)",
                        }} />
                      )}
                      <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        {accessible ? (
                          <div style={{
                            width: isMobile ? 36 : 44, height: isMobile ? 36 : 44,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ fontSize: isMobile ? 14 : 18, marginLeft: 3 }}>▶</span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: isMobile ? 20 : 26 }}>🔒</span>
                            {video.ppv_price && (
                              <div style={{
                                background: PINK, borderRadius: 8, padding: "3px 10px",
                                color: "#fff", fontSize: 11, fontWeight: 700,
                              }}>${video.ppv_price}</div>
                            )}
                          </div>
                        )}
                      </div>
                      {video.duration_seconds && (
                        <div style={{
                          position: "absolute", bottom: 6, right: 6,
                          background: "rgba(0,0,0,0.85)", borderRadius: 5,
                          padding: "2px 6px", fontSize: 10, color: "#fff", fontWeight: 700,
                        }}>{fmtDuration(video.duration_seconds)}</div>
                      )}
                    </div>
                    <div style={{ padding: isMobile ? "8px 10px 10px" : "10px 12px 12px" }}>
                      <div style={{ color: "#fff", fontSize: isMobile ? 11 : 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
                        {video.title || "Exclusive Video"}
                      </div>
                      {accessible && (
                        <button onClick={(e) => { e.stopPropagation(); setShowTip(video.id); }} style={{
                          background: "none", border: "1px solid rgba(245,166,35,0.3)",
                          borderRadius: 6, padding: "3px 8px", color: "#f5a623",
                          cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                        }}>💛 Tip</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={() => setShowSub(true)} style={{
            width: "100%", background: "transparent", border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: isMobile ? "13px" : "14px",
            color: "#fff", fontSize: isMobile ? 12 : 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: 1, fontFamily: "inherit",
          }}>🔒 UNLOCK ALL VIDEOS</button>
        </div>
      </div>

      {/* Video player overlay */}
      {playing && (
        <div
          onClick={() => setPlaying(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", zIndex: 999,
            padding: isMobile ? 10 : 20,
          }}
        >
          <button onClick={() => setPlaying(null)} style={{
            position: "absolute", top: isMobile ? 12 : 20, right: isMobile ? 12 : 20,
            background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
            fontSize: 20, cursor: "pointer", borderRadius: "50%",
            width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <video
            src={playing.url} controls autoPlay
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "94vw", maxHeight: "78vh", borderRadius: 12 }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setShowTip(playing.item.id); }}
            style={{
              marginTop: 16, background: "rgba(245,166,35,0.1)",
              border: "1px solid #f5a623", borderRadius: 12,
              padding: isMobile ? "9px 20px" : "10px 24px",
              color: "#f5a623", fontWeight: 700,
              cursor: "pointer", fontSize: isMobile ? 12 : 14, fontFamily: "inherit",
            }}
          >💛 Send Tip for this Video</button>
        </div>
      )}

      {selectedPPV && <PPVModal content={selectedPPV} onClose={() => setSelectedPPV(null)} />}
      {showSub && <SubscriptionModal onClose={() => setShowSub(false)} onLogin={() => { setShowSub(false); setShowAuth(true); }} />}
      {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      {showTip && <TipModal contentId={showTip} onClose={() => setShowTip(null)} />}
    </div>
  );
}