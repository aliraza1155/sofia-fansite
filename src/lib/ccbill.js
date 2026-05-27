// src/lib/ccbill.js
// ============================================================
// CCBill Payment Integration
//
// HOW CCBILL WORKS:
// 1. You generate a payment URL pointing to CCBill's hosted form
// 2. Fan completes payment on CCBill's page (you never handle card data)
// 3. CCBill sends a webhook POST to your server with transaction details
// 4. Your server verifies the webhook and updates Supabase
// 5. Fan is redirected back to your site with success/fail params
//
// SETUP CHECKLIST:
// - Apply at https://www.ccbill.com/merchant-application
// - Get your Client Account ID (6 digits), Sub-Account ID, Datalink Username/Password
// - Set up webhook URL in CCBill Merchant Panel → Webhook Manager
//   Webhook URL: https://your-domain.com/api/ccbill-webhook
// - Set up your Pricing Point IDs for each plan in CCBill Panel
// ============================================================

const CCBILL_CONFIG = {
  // Replace these with your real CCBill credentials
  clientAccountId: process.env.REACT_APP_CCBILL_CLIENT_ACCOUNT_ID || "000000",
  subAccountId: process.env.REACT_APP_CCBILL_SUB_ACCOUNT_ID || "0000",
  flexformId: process.env.REACT_APP_CCBILL_FLEXFORM_ID || "YOUR_FLEXFORM_ID",
  currencyCode: "840", // USD
  salt: process.env.REACT_APP_CCBILL_SALT || "YOUR_CCBILL_SALT",

  // Pricing Point IDs — set these in CCBill Merchant Panel → Price Manager
  pricePoints: {
    monthly: process.env.REACT_APP_CCBILL_PP_MONTHLY || "MONTHLY_PP_ID",
    "3month": process.env.REACT_APP_CCBILL_PP_3MONTH || "3MONTH_PP_ID",
    "6month": process.env.REACT_APP_CCBILL_PP_6MONTH || "6MONTH_PP_ID",
  },

  // Your domain
  baseUrl: process.env.REACT_APP_BASE_URL || "https://sofiavarelli.com",
};

// ============================================================
// BUILD CCBILL PAYMENT URLS
// ============================================================

export const ccbill = {
  /**
   * Generate a subscription checkout URL
   * Opens CCBill's hosted payment form for the fan
   */
  getSubscriptionUrl({ plan, fanId, fanEmail, fanName }) {
    const pricePointId = CCBILL_CONFIG.pricePoints[plan];

    const params = new URLSearchParams({
      clientAccnum: CCBILL_CONFIG.clientAccountId,
      clientSubacc: CCBILL_CONFIG.subAccountId,
      formName: CCBILL_CONFIG.flexformId,
      currencyCode: CCBILL_CONFIG.currencyCode,
      pricePointId,
      // Pre-fill fan info
      email: fanEmail || "",
      firstName: (fanName || "").split(" ")[0] || "",
      lastName: (fanName || "").split(" ").slice(1).join(" ") || "",
      // Pass fan ID in custom fields to identify them in webhook
      "custom[1]": fanId || "",
      "custom[2]": plan,
      "custom[3]": "subscription",
      // Redirect URLs after payment
      redirectUrl: `${CCBILL_CONFIG.baseUrl}/payment-success?type=subscription&plan=${plan}`,
      redirectUrlDecline: `${CCBILL_CONFIG.baseUrl}/payment-failed`,
    });

    return `https://api.ccbill.com/wap-frontflex/flexforms/${CCBILL_CONFIG.flexformId}?${params}`;
  },

  /**
   * Generate a Pay-Per-View checkout URL
   */
  getPPVUrl({ contentId, price, fanId, fanEmail, contentTitle }) {
    const params = new URLSearchParams({
      clientAccnum: CCBILL_CONFIG.clientAccountId,
      clientSubacc: CCBILL_CONFIG.subAccountId,
      formName: CCBILL_CONFIG.flexformId,
      currencyCode: CCBILL_CONFIG.currencyCode,
      // One-time price
      initialPeriod: "2",        // 2-day billing period (effectively one-time)
      initialPrice: price.toFixed(2),
      recurringPeriod: "9999",   // No recur
      recurringPrice: "0.00",
      numRebills: "0",
      email: fanEmail || "",
      "custom[1]": fanId || "",
      "custom[2]": contentId,
      "custom[3]": "ppv",
      redirectUrl: `${CCBILL_CONFIG.baseUrl}/payment-success?type=ppv&contentId=${contentId}`,
      redirectUrlDecline: `${CCBILL_CONFIG.baseUrl}/payment-failed`,
    });

    return `https://api.ccbill.com/wap-frontflex/flexforms/${CCBILL_CONFIG.flexformId}?${params}`;
  },

  /**
   * Generate a Bundle purchase URL
   */
  getBundleUrl({ bundleId, price, fanId, fanEmail, bundleTitle }) {
    const params = new URLSearchParams({
      clientAccnum: CCBILL_CONFIG.clientAccountId,
      clientSubacc: CCBILL_CONFIG.subAccountId,
      formName: CCBILL_CONFIG.flexformId,
      currencyCode: CCBILL_CONFIG.currencyCode,
      initialPeriod: "2",
      initialPrice: price.toFixed(2),
      recurringPeriod: "9999",
      recurringPrice: "0.00",
      numRebills: "0",
      email: fanEmail || "",
      "custom[1]": fanId || "",
      "custom[2]": bundleId,
      "custom[3]": "bundle",
      redirectUrl: `${CCBILL_CONFIG.baseUrl}/payment-success?type=bundle&bundleId=${bundleId}`,
      redirectUrlDecline: `${CCBILL_CONFIG.baseUrl}/payment-failed`,
    });

    return `https://api.ccbill.com/wap-frontflex/flexforms/${CCBILL_CONFIG.flexformId}?${params}`;
  },

  /**
   * Generate Pay-Per-Message unlock URL
   */
  getMessageUnlockUrl({ messageId, price, fanId, fanEmail }) {
    const params = new URLSearchParams({
      clientAccnum: CCBILL_CONFIG.clientAccountId,
      clientSubacc: CCBILL_CONFIG.subAccountId,
      formName: CCBILL_CONFIG.flexformId,
      currencyCode: CCBILL_CONFIG.currencyCode,
      initialPeriod: "2",
      initialPrice: price.toFixed(2),
      recurringPeriod: "9999",
      recurringPrice: "0.00",
      numRebills: "0",
      email: fanEmail || "",
      "custom[1]": fanId || "",
      "custom[2]": messageId,
      "custom[3]": "message_unlock",
      redirectUrl: `${CCBILL_CONFIG.baseUrl}/payment-success?type=message&messageId=${messageId}`,
      redirectUrlDecline: `${CCBILL_CONFIG.baseUrl}/payment-failed`,
    });

    return `https://api.ccbill.com/wap-frontflex/flexforms/${CCBILL_CONFIG.flexformId}?${params}`;
  },

  /**
   * Generate Tip URL
   */
  getTipUrl({ amount, fanId, fanEmail, contentId, message }) {
    const params = new URLSearchParams({
      clientAccnum: CCBILL_CONFIG.clientAccountId,
      clientSubacc: CCBILL_CONFIG.subAccountId,
      formName: CCBILL_CONFIG.flexformId,
      currencyCode: CCBILL_CONFIG.currencyCode,
      initialPeriod: "2",
      initialPrice: amount.toFixed(2),
      recurringPeriod: "9999",
      recurringPrice: "0.00",
      numRebills: "0",
      email: fanEmail || "",
      "custom[1]": fanId || "",
      "custom[2]": contentId || "",
      "custom[3]": "tip",
      "custom[4]": message || "",
      redirectUrl: `${CCBILL_CONFIG.baseUrl}/payment-success?type=tip&amount=${amount}`,
      redirectUrlDecline: `${CCBILL_CONFIG.baseUrl}/payment-failed`,
    });

    return `https://api.ccbill.com/wap-frontflex/flexforms/${CCBILL_CONFIG.flexformId}?${params}`;
  },
};

// ============================================================
// WEBHOOK VERIFICATION (server-side only — Node.js/Express)
// ============================================================
// This code runs on YOUR SERVER, not in the browser.
// Deploy it to Railway, Render, or any Node.js host.
//
// Example webhook handler (Express):
//
// const crypto = require('crypto');
//
// app.post('/api/ccbill-webhook', express.urlencoded({ extended: true }), async (req, res) => {
//   const { eventType, clientAccnum, clientSubacc, subscriptionId,
//           transactionId, initialPrice, custom1, custom2, custom3 } = req.body;
//
//   // Verify the MD5 hash CCBill sends
//   const hash = crypto.createHash('md5')
//     .update(clientAccnum + clientSubacc + subscriptionId + '1' + CCBILL_SALT)
//     .digest('hex');
//
//   if (hash !== req.body.digest) {
//     return res.status(400).send('Invalid signature');
//   }
//
//   const fanId = custom1;
//   const referenceId = custom2;
//   const paymentType = custom3; // 'subscription', 'ppv', 'bundle', 'message_unlock', 'tip'
//
//   if (eventType === 'NewSaleSuccess') {
//     switch (paymentType) {
//       case 'subscription':
//         await activateSubscription(fanId, custom2, initialPrice, subscriptionId, transactionId);
//         break;
//       case 'ppv':
//         await grantPPVAccess(fanId, referenceId, transactionId);
//         break;
//       case 'bundle':
//         await grantBundleAccess(fanId, referenceId, initialPrice, transactionId);
//         break;
//       case 'message_unlock':
//         await unlockMessage(fanId, referenceId, transactionId);
//         break;
//       case 'tip':
//         await recordTip(fanId, initialPrice, transactionId, req.body.custom4);
//         break;
//     }
//   }
//
//   if (eventType === 'Cancellation') {
//     await cancelSubscription(subscriptionId);
//   }
//
//   res.send('OK');
// });