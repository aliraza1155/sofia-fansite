// src/pages/VideosPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { contentHelpers } from "../lib/supabase";
import { SubscriptionModal, PPVModal, TipModal } from "../components/PaymentModal";
import { AuthModal } from "../components/AuthModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";
const CATS = ["All Videos", "Solo Videos", "Bikini Videos", "Behind the Scenes", "Custom Videos", "Favorites"];

function fmtDuration(s) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideosPage() {
  const { fan, hasAccess } = useAuth(); // removed isSubscribed
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState("All Videos");
  const [sort, setSort] = useState("Newest");
  const [loading, setLoading] = useState(true);
  const [selectedPPV, setSelectedPPV] = useState(null);
  const [showSub, setShowSub] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showTip, setShowTip] = useState(null);
  const [playing, setPlaying] = useState(null); // { url, item }

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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24 }}>
      {/* Sidebar */}
      <div>
        <div style={{ color: "#888", fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>VIDEOS</div>
        {CATS.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            display: "block", width: "100%", textAlign: "left",
            background: category === cat ? "rgba(232,84,122,0.1)" : "transparent",
            border: "none", padding: "10px 14px", borderRadius: 8,
            color: category === cat ? "#fff" : "#888",
            cursor: "pointer", fontSize: 13, fontFamily: "inherit",
            borderLeft: `3px solid ${category === cat ? PINK : "transparent"}`,
            marginBottom: 2,
          }}>{cat}</button>
        ))}
      </div>

      {/* Main */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>ALL VIDEOS</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Newest", "Popular", "Longest"].map((s) => (
              <button key={s} onClick={() => setSort(s)} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                background: sort === s ? PINK : "#1a1a1a",
                color: "#fff", fontSize: 12, fontWeight: sort === s ? 700 : 400, fontFamily: "inherit",
              }}>{s}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#555" }}>Loading...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {videos.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#555" }}>
                No videos yet in this category.
              </div>
            )}
            {videos.map((video) => {
              const accessible = hasAccess(video);
              const thumbUrl = video.thumbnail_path
                ? contentHelpers.getPublicUrl("thumbnails", video.thumbnail_path)
                : null;
              return (
                <div key={video.id} onClick={() => handleVideoClick(video)} style={{
                  borderRadius: 12, overflow: "hidden", background: "#1a1a1a",
                  cursor: "pointer", position: "relative",
                }}>
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
                          width: 44, height: 44, borderRadius: "50%",
                          background: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ fontSize: 18 }}>▶</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 24 }}>🔒</span>
                          {video.ppv_price && (
                            <div style={{
                              background: PINK, borderRadius: 8, padding: "3px 10px",
                              color: "#fff", fontSize: 12, fontWeight: 700,
                            }}>${video.ppv_price}</div>
                          )}
                        </div>
                      )}
                    </div>
                    {video.duration_seconds && (
                      <div style={{
                        position: "absolute", bottom: 8, right: 8,
                        background: "rgba(0,0,0,0.8)", borderRadius: 6,
                        padding: "2px 6px", fontSize: 11, color: "#fff", fontWeight: 700,
                      }}>{fmtDuration(video.duration_seconds)}</div>
                    )}
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      {video.title || "Exclusive Video"}
                    </div>
                    {accessible && (
                      <button onClick={(e) => { e.stopPropagation(); setShowTip(video.id); }} style={{
                        background: "none", border: "1px solid #f5a62333",
                        borderRadius: 6, padding: "3px 8px", color: "#f5a623",
                        cursor: "pointer", fontSize: 11, fontFamily: "inherit",
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
          borderRadius: 10, padding: "14px", color: "#fff", fontSize: 13, fontWeight: 700,
          cursor: "pointer", letterSpacing: 1, fontFamily: "inherit",
        }}>
          🔒 UNLOCK ALL VIDEOS
        </button>
      </div>

      {/* Video player */}
      {playing && (
        <div onClick={() => setPlaying(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.97)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 999,
        }}>
          <button onClick={() => setPlaying(null)} style={{
            position: "absolute", top: 20, right: 20,
            background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer",
          }}>✕</button>
          <video
            src={playing.url}
            controls
            autoPlay
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: 12 }}
          />
          <button onClick={(e) => { e.stopPropagation(); setShowTip(playing.item.id); }} style={{
            marginTop: 20, background: "rgba(245,166,35,0.15)", border: "1px solid #f5a623",
            borderRadius: 12, padding: "10px 24px", color: "#f5a623", fontWeight: 700,
            cursor: "pointer", fontSize: 14, fontFamily: "inherit",
          }}>💛 Send Tip for this Video</button>
        </div>
      )}

      {selectedPPV && <PPVModal content={selectedPPV} onClose={() => setSelectedPPV(null)} />}
      {showSub && <SubscriptionModal onClose={() => setShowSub(false)} onLogin={() => { setShowSub(false); setShowAuth(true); }} />}
      {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      {showTip && <TipModal contentId={showTip} onClose={() => setShowTip(null)} />}
    </div>
  );
}