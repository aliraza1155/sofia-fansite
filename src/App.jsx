// src/App.jsx
import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CreatorDashboard from "./components/CreatorDashboard";
import { HomePage } from "./pages/HomePage";
import { GalleryPage } from "./pages/GalleryPage";
import { VideosPage } from "./pages/VideosPage";
import { MessagesPage } from "./pages/MessagesPage";
import { BundlesPage } from "./pages/BundlesPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SubscriptionModal } from "./components/PaymentModal";

// Legal pages
import { TermsOfService } from "./pages/legal/TermsOfService";
import { PrivacyPolicy } from "./pages/legal/PrivacyPolicy";
import { DmcaPolicy } from "./pages/legal/DmcaPolicy";
import { Compliance2257 } from "./pages/legal/Compliance2257";
import { ProhibitedContentPolicy } from "./pages/legal/ProhibitedContentPolicy";
import { ContentRemovalPolicy } from "./pages/legal/ContentRemovalPolicy";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

const NAV_ITEMS = [
  { key: "HOME", label: "Home", icon: "⌂", path: "/" },
  { key: "GALLERY", label: "Gallery", icon: "◻", path: "/gallery" },
  { key: "VIDEOS", label: "Videos", icon: "▷", path: "/videos" },
  { key: "MESSAGES", label: "Messages", icon: "✉", path: "/messages" },
  { key: "BUNDLES", label: "Bundles", icon: "✦", path: "/bundles" },
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

// Main layout with nav and footer – wraps all public pages
function PublicLayout({ children }) {
  const { fan, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSub, setShowSub] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { w } = useWindowSize();
  const isMobile = w < 768;
  const isTablet = w < 1024;
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "'Montserrat', sans-serif" }}>
      {/* NAVBAR */}
      <nav style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: isMobile ? "0 16px" : "0 32px",
        display: "flex", alignItems: "center",
        height: isMobile ? 52 : 60,
        background: "rgba(10,10,10,0.97)",
        position: "sticky", top: 0, zIndex: 200,
        backdropFilter: "blur(12px)",
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", marginRight: isMobile ? "auto" : 36, flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? 14 : 17,
            fontWeight: 700, color: "#fff", lineHeight: 1.1,
            letterSpacing: 0.5,
          }}>
            SOFIA VARELLI <span style={{ color: PINK }}>♥</span>
          </div>
          {!isMobile && <div style={{ fontSize: 8, color: "#555", letterSpacing: 3 }}>OFFICIAL FAN SITE</div>}
        </div>

        {!isMobile && (
          <div style={{ display: "flex", flex: 1 }}>
            {NAV_ITEMS.map(item => (
              <Link key={item.key} to={item.path} style={{
                background: "transparent", border: "none",
                color: isActive(item.path) ? PINK : "#888",
                fontSize: isTablet ? 10 : 11,
                fontWeight: 700, letterSpacing: 1.5, cursor: "pointer",
                padding: isTablet ? "0 10px" : "0 16px",
                height: 60, display: "inline-flex", alignItems: "center",
                borderBottom: isActive(item.path) ? `2px solid ${PINK}` : "2px solid transparent",
                fontFamily: "'Montserrat', sans-serif",
                textDecoration: "none",
                transition: "color 0.2s",
              }}>{item.label}</Link>
            ))}
          </div>
        )}

        {!isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!fan ? (
              <>
                <Link to="/login" style={{
                  background: "transparent", border: `1px solid ${BORDER}`, color: "#aaa",
                  borderRadius: 8, padding: "7px 16px", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
                }}>LOG IN</Link>
                <button onClick={() => setShowSub(true)} style={{
                  background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                  border: "none", borderRadius: 8, padding: "7px 16px",
                  color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer",
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
                <button onClick={handleLogout} style={{
                  background: "transparent", border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: "6px 14px", color: "#888",
                  fontSize: 11, cursor: "pointer",
                }}>Sign Out</button>
              </div>
            )}
          </div>
        )}

        {isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!fan && (
              <button onClick={() => setShowSub(true)} style={{
                background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                border: "none", borderRadius: 20, padding: "6px 14px",
                color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer",
              }}>JOIN</button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: "none", border: "none", cursor: "pointer", padding: 6, color: "#fff",
              display: "flex", flexDirection: "column", gap: 5,
            }}>
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? PINK : "#fff", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "transparent" : "#fff", transition: "all 0.3s" }} />
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? PINK : "#fff", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          </div>
        )}
      </nav>

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
            <Link key={item.key} to={item.path} onClick={() => setMenuOpen(false)} style={{
              display: "flex", alignItems: "center", gap: 14,
              width: "100%", background: isActive(item.path) ? "rgba(232,84,122,0.08)" : "none",
              border: "none", borderLeft: `3px solid ${isActive(item.path) ? PINK : "transparent"}`,
              padding: "16px 24px", color: isActive(item.path) ? "#fff" : "#888",
              fontSize: 13, fontWeight: isActive(item.path) ? 700 : 500,
              cursor: "pointer", textDecoration: "none",
            }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 24px", display: "flex", gap: 10 }}>
            {!fan ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, background: "transparent", border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: "10px", color: "#aaa", fontSize: 12,
                  fontWeight: 700, cursor: "pointer", textDecoration: "none", textAlign: "center",
                }}>LOG IN</Link>
                <button onClick={() => { setShowSub(true); setMenuOpen(false); }} style={{
                  flex: 1, background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                  border: "none", borderRadius: 8, padding: "10px",
                  color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>JOIN SOFIA ♥</button>
              </>
            ) : (
              <button onClick={handleLogout} style={{
                width: "100%", background: "transparent", border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: "10px", color: "#888", fontSize: 12, cursor: "pointer",
              }}>Sign Out ({fan.email})</button>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: isMobile ? "20px 14px 80px" : isTablet ? "24px 20px 40px" : "32px 28px 48px",
      }}>
        {children}
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(10,10,10,0.97)", borderTop: `1px solid ${BORDER}`,
          display: "flex", zIndex: 200,
          backdropFilter: "blur(12px)",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.key} to={item.path} onClick={() => setMenuOpen(false)} style={{
              flex: 1, background: "none", border: "none",
              padding: "10px 4px 8px",
              color: isActive(item.path) ? PINK : "#555",
              cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              textDecoration: "none",
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: isActive(item.path) ? 700 : 500, letterSpacing: 0.5 }}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Footer with legal links – now using React Router Link */}
      <footer style={{
        marginTop: 80,
        borderTop: `1px solid ${BORDER}`,
        padding: "32px 20px 40px",
        textAlign: "center",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
          <Link to="/terms-of-service" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>Terms of Service</Link>
          <Link to="/privacy-policy" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>Privacy Policy</Link>
          <Link to="/dmca" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>DMCA Policy</Link>
          <Link to="/2257" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>18 U.S.C. 2257</Link>
          <Link to="/prohibited-content-policy" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>Prohibited Content</Link>
          <Link to="/content-removal" style={{ color: "#888", fontSize: 12, textDecoration: "none" }}>Content Removal</Link>
        </div>
        <div style={{ color: "#555", fontSize: 11 }}>© 2026 Sofia Varelli. All rights reserved.</div>
      </footer>

      {showSub && (
        <SubscriptionModal
          onClose={() => setShowSub(false)}
          onLogin={() => { setShowSub(false); window.location.href = "/login"; }}
        />
      )}
    </div>
  );
}

function HomePageWrapper() {
  const navigate = useNavigate();
  return <HomePage onNavigate={(page) => {
    const route = NAV_ITEMS.find(i => i.key === page)?.path || "/";
    navigate(route);
  }} />;
}

function PublicRoutes() {
  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<HomePageWrapper />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/bundles" element={<BundlesPage />} />
      </Routes>
    </PublicLayout>
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
      {showDashboard ? (
        <CreatorDashboard onExit={() => setShowDashboard(false)} />
      ) : (
        <BrowserRouter>
          <Routes>
            {/* Main public routes with layout */}
            <Route path="/*" element={<PublicRoutes />} />

            {/* Authentication routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Legal pages (no layout – clean standalone) */}
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/dmca" element={<DmcaPolicy />} />
            <Route path="/2257" element={<Compliance2257 />} />
            <Route path="/prohibited-content-policy" element={<ProhibitedContentPolicy />} />
            <Route path="/content-removal" element={<ContentRemovalPolicy />} />
          </Routes>
        </BrowserRouter>
      )}
    </AuthProvider>
  );
}