import { useState, useEffect } from "react";
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
const NAV_ITEMS = ["HOME", "GALLERY", "VIDEOS", "MESSAGES", "BUNDLES"];

function PublicSite() {
  const [activePage, setActivePage] = useState("HOME");
  const { fan } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showSub, setShowSub] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "HOME": return <HomePage onNavigate={(page) => setActivePage(page)} />;
      case "GALLERY": return <GalleryPage />;
      case "VIDEOS": return <VideosPage />;
      case "MESSAGES": return <MessagesPage />;
      case "BUNDLES": return <BundlesPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "'Montserrat', sans-serif" }}>
      <nav style={{
        borderBottom: `1px solid ${BORDER}`, padding: "0 40px",
        display: "flex", alignItems: "center", height: 58,
        background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#fff", marginRight: 40, cursor: "pointer" }}
          onClick={() => setActivePage("HOME")}>
          SOFIA VARELLI <span style={{ color: PINK }}>♥</span>
          <div style={{ fontSize: 9, color: "#555", letterSpacing: 2 }}>OFFICIAL FAN SITE</div>
        </div>
        <div style={{ display: "flex", flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button key={item} onClick={() => setActivePage(item)} style={{
              background: "transparent", border: "none",
              color: activePage === item ? PINK : "#888",
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5, cursor: "pointer",
              padding: "0 16px", height: 58,
              borderBottom: activePage === item ? `2px solid ${PINK}` : "2px solid transparent",
            }}>{item}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!fan ? (
            <>
              <button onClick={() => setShowAuth(true)} style={{
                background: "transparent", border: `1px solid ${BORDER}`, color: "#fff",
                borderRadius: 8, padding: "8px 18px", fontSize: 11, fontWeight: 700,
              }}>LOG IN</button>
              <button onClick={() => setShowSub(true)} style={{
                background: `linear-gradient(135deg, ${PINK}, #c73460)`, border: "none",
                borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 11, fontWeight: 700,
              }}>JOIN SOFIA</button>
            </>
          ) : (
            <>
              <span style={{ color: "#888", fontSize: 12 }}>{fan.email}</span>
              <button onClick={() => window.location.reload()}>Logout</button>
            </>
          )}
          {/* Creator button removed - now accessible only via ?creator=true */}
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {renderPage()}
      </div>

      {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
      {showSub && <SubscriptionModal onClose={() => setShowSub(false)} onLogin={() => { setShowSub(false); setShowAuth(true); }} />}
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