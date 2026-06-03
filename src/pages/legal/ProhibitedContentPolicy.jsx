import React from "react";
import { LegalLayout } from "../../components/LegalLayout";

export function ProhibitedContentPolicy() {
  return (
    <LegalLayout title="Prohibited Content Policy" lastUpdated="June 2, 2026">
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>
        Sofia Varelli (sofiavarelli.com) is committed to providing a safe and lawful environment. The following types of content and conduct are strictly prohibited.
      </p>
      <ul style={{ color: "#ccc", lineHeight: 1.6, marginLeft: 20, marginBottom: 20 }}>
        <li>Deepfakes & AI Manipulation</li>
        <li>Underage Content (including subjects in diapers)</li>
        <li>Non-Consensual Activity (sleeping, drugged, coerced)</li>
        <li>Incest, bestiality, violence, snuff, abduction, torture</li>
        <li>Watersports, prostitution/escorting, polygamy, hate speech</li>
        <li>Illegal activity (bomb‑making, drug production, etc.)</li>
        <li>Professional advice without credentials</li>
      </ul>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Enforcement</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>Violation results in immediate content removal, permanent account termination, and potential law enforcement reporting.</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Reporting Violations</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>Email <a href="mailto:support@sofiavarelli.com" style={{ color: "#E8547A" }}>support@sofiavarelli.com</a>. Reports are reviewed within 24 hours.</p>
    </LegalLayout>
  );
}