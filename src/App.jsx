import { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CreatorDashboard from "./components/CreatorDashboard";
import { HomePage } from "./pages/HomePage";
import { GalleryPage } from "./pages/GalleryPage";
import { VideosPage } from "./pages/VideosPage";
import { MessagesPage } from "./pages/MessagesPage";
import { BundlesPage } from "./pages/BundlesPage";
import { AuthModal } from "./components/AuthModal";
import { SubscriptionModal } from "./components/PaymentModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";
const NAV_ITEMS = [
  { key: "HOME", label: "Home", icon: "⌂" },
  { key: "GALLERY", label: "Gallery", icon: "◻" },
  { key: "VIDEOS", label: "Videos", icon: "▷" },
  { key: "MESSAGES", label: "Messages", icon: "✉" },
  { key: "BUNDLES", label: "Bundles", icon: "✦" },
];

function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const handler = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

function PublicSite() {
  const [activePage, setActivePage] = useState("HOME");
  const { fan, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { w } = useWindowSize();
  const isMobile = w < 768;
  const isTablet = w < 1024;
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close menu on navigate
  const navigate = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case "HOME": return <HomePage onNavigate={navigate} />;
      case "GALLERY": return <GalleryPage />;
      case "VIDEOS": return <VideosPage />;
      case "MESSAGES": return <MessagesPage />;
      case "BUNDLES": return <BundlesPage />;
      default: return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "'Montserrat', sans-serif" }}>
      {/* ── NAV ── */}
      <nav style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: isMobile ? "0 16px" : "0 32px",
        display: "flex", alignItems: "center",
        height: isMobile ? 52 : 60,
        background: "rgba(10,10,10,0.97)",
        position: "sticky", top: 0, zIndex: 200,
        backdropFilter: "blur(12px)",
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate("HOME")}
          style={{ cursor: "pointer", marginRight: isMobile ? "auto" : 36, flexShrink: 0 }}
        >
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 14 : 17,
            fontWeight: 700, color: "#fff", lineHeight: 1.1,
            letterSpacing: 0.5,
          }}>
            SOFIA VARELLI <span style={{ color: PINK }}>♥</span>
          </div>
          {!isMobile && (
            <div style={{ fontSize: 8, color: "#555", letterSpacing: 3 }}>OFFICIAL FAN SITE</div>
          )}
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: "flex", flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => navigate(item.key)} style={{
                background: "transparent", border: "none",
                color: activePage === item.key ? PINK : "#888",
                fontSize: isTablet ? 10 : 11,
                fontWeight: 700, letterSpacing: 1.5, cursor: "pointer",
                padding: isTablet ? "0 10px" : "0 16px",
                height: 60,
                borderBottom: activePage === item.key ? `2px solid ${PINK}` : "2px solid transparent",
                fontFamily: "'Montserrat', sans-serif",
                transition: "color 0.2s",
              }}>{item.label}</button>
            ))}
          </div>
        )}

        {/* Desktop auth buttons */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!fan ? (
              <>
                <button onClick={() => setShowAuth(true)} style={{
                  background: "transparent", border: `1px solid ${BORDER}`, color: "#aaa",
                  borderRadius: 8, padding: "7px 16px", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                }}>LOG IN</button>
                <button onClick={() => setShowSub(true)} style={{
                  background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                  border: "none", borderRadius: 8, padding: "7px 16px",
                  color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit",
                }}>JOIN SOFIA</button>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 13,
                }}>
                  {fan.email?.[0]?.toUpperCase() || "F"}
                </div>
                <button onClick={() => signOut()} style={{
                  background: "transparent", border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: "6px 14px", color: "#888",
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                }}>Sign Out</button>
              </div>
            )}
          </div>
        )}

        {/* Mobile: Join button + hamburger */}
        {isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!fan && (
              <button onClick={() => setShowSub(true)} style={{
                background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                border: "none", borderRadius: 20, padding: "6px 14px",
                color: "#fff", fontSize: 10, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>JOIN</button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none", border: "none",
                cursor: "pointer", padding: 6, color: "#fff",
                display: "flex", flexDirection: "column", gap: 5,
              }}
            >
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? PINK : "#fff", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "transparent" : "#fff", transition: "all 0.3s" }} />
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? PINK : "#fff", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div ref={menuRef} style={{
          position: "fixed", top: 52, left: 0, right: 0,
          background: "rgba(10,10,10,0.98)", zIndex: 199,
          borderBottom: `1px solid ${BORDER}`,
          backdropFilter: "blur(16px)",
          animation: "slideDown 0.2s ease",
        }}>
          <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => navigate(item.key)} style={{
              display: "flex", alignItems: "center", gap: 14,
              width: "100%", background: activePage === item.key ? "rgba(232,84,122,0.08)" : "none",
              border: "none", borderLeft: `3px solid ${activePage === item.key ? PINK : "transparent"}`,
              padding: "16px 24px", color: activePage === item.key ? "#fff" : "#888",
              fontSize: 13, fontWeight: activePage === item.key ? 700 : 500,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 24px", display: "flex", gap: 10 }}>
            {!fan ? (
              <>
                <button onClick={() => { setShowAuth(true); setMenuOpen(false); }} style={{
                  flex: 1, background: "transparent", border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: "10px", color: "#aaa", fontSize: 12,
                  fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}>LOG IN</button>
                <button onClick={() => { setShowSub(true); setMenuOpen(false); }} style={{
                  flex: 1, background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                  border: "none", borderRadius: 8, padding: "10px",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}>JOIN SOFIA ♥</button>
              </>
            ) : (
              <button onClick={() => { signOut(); setMenuOpen(false); }} style={{
                width: "100%", background: "transparent", border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: "10px", color: "#888", fontSize: 12,
                cursor: "pointer", fontFamily: "inherit",
              }}>Sign Out ({fan.email})</button>
            )}
          </div>
        </div>
      )}

      {/* Page content */}
      <div style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: isMobile ? "20px 14px 80px" : isTablet ? "24px 20px 40px" : "32px 28px 48px",
      }}>
        {renderPage()}
      </div>

      {/* Mobile bottom nav bar */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(10,10,10,0.97)", borderTop: `1px solid ${BORDER}`,
          display: "flex", zIndex: 200,
          backdropFilter: "blur(12px)",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => navigate(item.key)} style={{
              flex: 1, background: "none", border: "none",
              padding: "10px 4px 8px",
              color: activePage === item.key ? PINK : "#555",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: activePage === item.key ? 700 : 500, letterSpacing: 0.5 }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {showAuth && (
        <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
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

export default function App() {
  const [showDashboard, setShowDashboard] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("creator") === "true";
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      setShowDashboard(params.get("creator") === "true");
    };
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  return (
    <AuthProvider>
      {showDashboard
        ? <CreatorDashboard onExit={() => setShowDashboard(false)} />
        : <PublicSite />
      }
    </AuthProvider>
  );
}