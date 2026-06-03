import React from "react";
import { LegalLayout } from "../../components/LegalLayout";

export function DmcaPolicy() {
  return (
    <LegalLayout title="DMCA Copyright Policy" lastUpdated="June 2, 2026">
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>
        Sofia Varelli respects the intellectual property rights of others. In accordance with the Digital Millennium Copyright Act (DMCA), we have established the following policy for reporting copyright infringement.
      </p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Notification of Infringement</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>If you believe that any content on sofiavarelli.com infringes your copyright, please send a written notice to our Designated Agent with the required information (signature, identification of work, location, contact info, good faith statement, and accuracy statement).</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Designated Agent</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>Email: <a href="mailto:support@sofiavarelli.com" style={{ color: "#E8547A" }}>support@sofiavarelli.com</a></p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Counter-Notification</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>If you believe your content was removed by mistake, you may send a counter-notification as described in 17 U.S.C. § 512(g).</p>
      <h2 style={{ color: "#E8547A", fontSize: 22, margin: "30px 0 15px" }}>Repeat Infringers</h2>
      <p style={{ color: "#ccc", lineHeight: 1.6, marginBottom: 20 }}>We will terminate the accounts of users who are determined to be repeat infringers.</p>
    </LegalLayout>
  );
}