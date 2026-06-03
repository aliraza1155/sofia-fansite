import React from "react";
import { LegalLayout } from "../../components/LegalLayout";

export function ContentRemovalPolicy() {
  return (
    <LegalLayout title="Content Removal & Complaints" lastUpdated="June 2, 2026">
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Grounds for Removal</h2>
      <ul style={{ color: "#ccc", lineHeight: 1.6, marginLeft: 20, marginBottom: 20 }}>
        <li>Violation of Terms of Service or Prohibited Content Policy</li>
        <li>DMCA copyright infringement notices</li>
        <li>Court orders or law enforcement requests</li>
        <li>Documented lack of consent</li>
        <li>Non-compliance with 2257 record‑keeping</li>
      </ul>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>How to Submit a Removal Request</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>Send written complaint to <a href="mailto:support@sofiavarelli.com" style={{ color: "#E8547A" }}>support@sofiavarelli.com</a> including your name, specific URLs, description of violation, and a statement of accuracy.</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Review Timeline</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>We will acknowledge receipt within 2 business days and aim to resolve within 5 business days.</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Appeals</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>If you are the creator of removed content, you may appeal within 7 days.</p>
    </LegalLayout>
  );
}