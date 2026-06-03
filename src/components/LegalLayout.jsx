// src/components/LegalLayout.jsx
import React from "react";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

export function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ background: "#141414", borderRadius: 16, padding: "40px", border: `1px solid ${BORDER}` }}>
        <h1 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 10 }}>{title}</h1>
        <div style={{ color: "#666", fontSize: 14, marginBottom: 30 }}>Last Updated: {lastUpdated}</div>
        {children}
      </div>
    </div>
  );
}