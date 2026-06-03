import React from "react";
import { LegalLayout } from "../../components/LegalLayout";

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="June 2, 2026">
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>
        This Privacy Policy explains how Sofia Varelli ("we", "us", "our") collects, uses, and protects your personal information when you visit or use our website (sofiavarelli.com).
      </p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>1. Information We Collect</h2>
      <ul style={{ color: "#ccc", lineHeight: 1.6, marginLeft: 20, marginBottom: 20 }}>
        <li><strong>Account Information:</strong> When you register, we collect your email address and a hashed password. We may also collect your name if you provide it.</li>
        <li><strong>Payment Information:</strong> All payments are processed by CCBill. We do not collect or store your credit card details.</li>
        <li><strong>Usage Data:</strong> IP address, browser type, device, pages visited.</li>
        <li><strong>Messages:</strong> Your messages to the creator are stored on our servers and may be reviewed for compliance.</li>
        <li><strong>Content Consumption:</strong> We may track which photos or videos you view to provide personalised recommendations.</li>
      </ul>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>2. How We Use Your Information</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>To provide, maintain, and improve the Platform; process payments; communicate with you; enforce our Terms; comply with legal obligations.</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>3. Sharing of Information</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>We share necessary data with CCBill for payment processing. We may disclose information if required by law. We do not sell your personal information.</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>4. Data Retention</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>We retain your account information as long as your account is active. After deletion, we may retain certain data for legal or compliance purposes.</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>5. Your Rights</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>You may have the right to access, correct, delete, or restrict processing of your personal data. Contact <a href="mailto:support@sofiavarelli.com" style={{ color: "#E8547A" }}>support@sofiavarelli.com</a>.</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>6. Contact</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>For privacy questions: <a href="mailto:support@sofiavarelli.com" style={{ color: "#E8547A" }}>support@sofiavarelli.com</a>.</p>
    </LegalLayout>
  );
}