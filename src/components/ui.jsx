export const PINK = "#E8547A";
export const PINK_LIGHT = "#F06292";
export const DARK_BG = "#0D0D0D";
export const CARD_BG = "#181818";
export const BORDER = "#2E2E2E";
export const TEXT_MUTED = "#888";
export const TEXT_DIM = "#555";

export const inputStyle = {
  width: "100%",
  background: "#111",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: "11px 14px",
  color: "#fff",
  fontSize: 13,
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "'Montserrat', sans-serif",
};

export function LockIcon({ size = 20, color = TEXT_DIM }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="22" fill="rgba(0,0,0,0.65)" />
      <polygon points="17,13 35,22 17,31" fill="white" />
    </svg>
  );
}

export function HeartIcon({ filled = false, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? PINK : "none"} stroke={PINK} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function TrashIcon({ size = 16, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

export function EditIcon({ size = 16, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function Avatar({ initials, size = 36, bg = "#333", src = null }) {
  if (src) {
    return (
      <img src={src} alt={initials} style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0,
      fontFamily: "'Playfair Display', serif",
    }}>{initials}</div>
  );
}

export function PinkButton({ children, onClick, style = {}, small = false }) {
  return (
    <button onClick={onClick} style={{
      background: `linear-gradient(135deg, ${PINK}, ${PINK_LIGHT})`,
      color: "#fff", border: "none", borderRadius: 10,
      padding: small ? "7px 16px" : "12px 24px",
      fontSize: small ? 11 : 13, fontWeight: 700, cursor: "pointer",
      fontFamily: "'Montserrat', sans-serif", letterSpacing: 0.5,
      display: "inline-flex", alignItems: "center", gap: 6,
      ...style,
    }}>{children}</button>
  );
}

export function GhostButton({ children, onClick, style = {}, small = false }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", color: TEXT_MUTED,
      border: `1px solid ${BORDER}`, borderRadius: 10,
      padding: small ? "7px 16px" : "12px 24px",
      fontSize: small ? 11 : 13, fontWeight: 600, cursor: "pointer",
      fontFamily: "'Montserrat', sans-serif", letterSpacing: 0.5,
      display: "inline-flex", alignItems: "center", gap: 6,
      ...style,
    }}>{children}</button>
  );
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const PHOTO_CATEGORIES = ["Lingerie", "Bikini", "Behind the Scenes", "Personal"];
export const VIDEO_CATEGORIES = ["Solo Videos", "Bikini Videos", "Behind the Scenes", "Custom Videos"];
