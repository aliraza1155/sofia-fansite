// src/lib/supabase.js
// ============================================================
// Supabase client + all database helpers
// Reads credentials from .env
// ============================================================

import { createClient } from "@supabase/supabase-js";

// Read environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// Regular client (uses anon key) – for all fan‑facing operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client (uses service role key) – for creator dashboard (bypasses RLS)
// Only used in CreatorDashboard – never exposed to fans
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : supabase; // fallback to regular client if service key missing

// ============================================================
// AUTH (including password reset)
// ============================================================

export const authHelpers = {
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from("fan_profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
      });
    }
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Password reset – sends email with reset link
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  // Update password after user clicks reset link
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export const subscriptionHelpers = {
  PLANS: {
    monthly: { label: "Monthly", price: 19.99, period: "month", ccbillPricePoint: "CCBILL_MONTHLY_PRICE_POINT_ID" },
    "3month": { label: "3 Months", price: 49.99, period: "3 months", ccbillPricePoint: "CCBILL_3MONTH_PRICE_POINT_ID" },
    "6month": { label: "6 Months", price: 89.99, period: "6 months", ccbillPricePoint: "CCBILL_6MONTH_PRICE_POINT_ID" },
  },

  async getActive(fanId) {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("fan_id", fanId)
      .eq("status", "active")
      .maybeSingle();
    return data;
  },

  async hasActive(fanId) {
    const { data } = await supabase.rpc("has_active_subscription", { p_fan_id: fanId });
    return data === true;
  },

  async activate({ fanId, plan, pricePaid, ccbillSubId, ccbillTxId, endsAt }) {
    const { data, error } = await supabase.from("subscriptions").insert({
      fan_id: fanId,
      plan,
      status: "active",
      price_paid: pricePaid,
      ccbill_subscription_id: ccbillSubId,
      ccbill_transaction_id: ccbillTxId,
      ends_at: endsAt,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async cancel(subscriptionId) {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", subscriptionId);
    if (error) throw error;
  },
};

// ============================================================
// CONTENT
// ============================================================

export const contentHelpers = {
  CATEGORIES: ["All Photos", "Lingerie", "Bikini", "Behind the Scenes", "Personal", "Favorites"],
  VIDEO_CATEGORIES: ["All Videos", "Solo Videos", "Bikini Videos", "Behind the Scenes", "Custom Videos", "Favorites"],

  async getAll(type = "photo", category = null) {
    let query = supabase
      .from("content")
      .select("*")
      .eq("type", type)
      .order("created_at", { ascending: false });

    if (category && category !== "All Photos" && category !== "All Videos") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase.from("content").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async canAccess(fanId, contentId) {
    const { data } = await supabase.rpc("can_access_content", {
      p_fan_id: fanId,
      p_content_id: contentId,
    });
    return data === true;
  },

  async getSignedUrl(storagePath, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from("content")
      .createSignedUrl(storagePath, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async upload(file, path, bucket = "content") {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    return path;
  },

  async create(contentData) {
    const { data, error } = await supabase.from("content").insert(contentData).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from("content").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id, storagePath) {
    await supabase.storage.from("content").remove([storagePath]);
    await supabase.from("content").delete().eq("id", id);
  },

  async grantAccess(fanId, contentId, accessType, transactionId) {
    const { error } = await supabase.from("content_access").upsert({
      fan_id: fanId,
      content_id: contentId,
      access_type: accessType,
      transaction_id: transactionId,
    });
    if (error) throw error;
  },

  async getUnlockedIds(fanId) {
    const { data } = await supabase
      .from("content_access")
      .select("content_id")
      .eq("fan_id", fanId);
    return (data || []).map((r) => r.content_id);
  },
};

// ============================================================
// MESSAGES / PAY-PER-MESSAGE
// ============================================================

export const messageHelpers = {
  async getThread(fanId) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("fan_id", fanId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendFanMessage(fanId, body) {
    const { data, error } = await supabase.from("messages").insert({
      fan_id: fanId,
      sender: "fan",
      body,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async sendCreatorReply({ fanId, body, lockedMediaPath, lockedMediaPrice }) {
    const { data, error } = await supabase.from("messages").insert({
      fan_id: fanId,
      sender: "sofia",
      body,
      locked_media_path: lockedMediaPath || null,
      locked_media_price: lockedMediaPrice || null,
      is_paid: !lockedMediaPath,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async markPaid(messageId, ccbillTxId) {
    const { error } = await supabase
      .from("messages")
      .update({ is_paid: true, ccbill_transaction_id: ccbillTxId })
      .eq("id", messageId);
    if (error) throw error;
  },

  async getAllThreads() {
    const { data, error } = await supabase
      .from("messages")
      .select("fan_id, fan_profiles(full_name, avatar_url), body, created_at, sender")
      .order("created_at", { ascending: false });
    if (error) throw error;
    const threads = {};
    (data || []).forEach((msg) => {
      if (!threads[msg.fan_id]) threads[msg.fan_id] = msg;
    });
    return Object.values(threads);
  },
};

// ============================================================
// BUNDLES
// ============================================================

export const bundleHelpers = {
  async getAll() {
    const { data, error } = await supabase
      .from("bundles")
      .select("*, bundle_items(content_id, content(*))")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(bundleData, contentIds) {
    const { data: bundle, error } = await supabase
      .from("bundles")
      .insert(bundleData)
      .select()
      .single();
    if (error) throw error;

    if (contentIds?.length) {
      await supabase.from("bundle_items").insert(
        contentIds.map((cid) => ({ bundle_id: bundle.id, content_id: cid }))
      );
    }
    return bundle;
  },

  async hasPurchased(fanId, bundleId) {
    const { data } = await supabase
      .from("bundle_purchases")
      .select("id")
      .eq("fan_id", fanId)
      .eq("bundle_id", bundleId)
      .maybeSingle();
    return !!data;
  },

  async recordPurchase(fanId, bundleId, pricePaid, ccbillTxId, contentIds) {
    await supabase.from("bundle_purchases").insert({
      fan_id: fanId,
      bundle_id: bundleId,
      price_paid: pricePaid,
      ccbill_transaction_id: ccbillTxId,
    });

    for (const cid of contentIds) {
      await contentHelpers.grantAccess(fanId, cid, "bundle", null);
    }
  },
};

// ============================================================
// TIPS
// ============================================================

export const tipHelpers = {
  AMOUNTS: [5, 10, 20, 50, 100],

  async send({ fanId, amount, message, contentId, ccbillTxId }) {
    const { data, error } = await supabase.from("tips").insert({
      fan_id: fanId,
      amount,
      message: message || null,
      content_id: contentId || null,
      ccbill_transaction_id: ccbillTxId,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async getTotal() {
    const { data } = await supabase.from("tips").select("amount");
    return (data || []).reduce((sum, t) => sum + Number(t.amount), 0);
  },
};

// ============================================================
// TRANSACTIONS
// ============================================================

export const transactionHelpers = {
  async log({ fanId, type, amount, status, ccbillTxId, ccbillSubId, referenceId, referenceType, metadata }) {
    const { data, error } = await supabase.from("transactions").insert({
      fan_id: fanId,
      type,
      amount,
      status,
      ccbill_transaction_id: ccbillTxId,
      ccbill_subscription_id: ccbillSubId,
      reference_id: referenceId,
      reference_type: referenceType,
      metadata,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, fan_profiles(full_name, email)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getSummary() {
    const { data } = await supabase.from("transactions").select("type, amount, status");
    const completed = (data || []).filter((t) => t.status === "completed");
    return {
      total: completed.reduce((s, t) => s + Number(t.amount), 0),
      subscriptions: completed.filter((t) => t.type === "subscription").reduce((s, t) => s + Number(t.amount), 0),
      ppv: completed.filter((t) => t.type === "ppv").reduce((s, t) => s + Number(t.amount), 0),
      messages: completed.filter((t) => t.type === "message_unlock").reduce((s, t) => s + Number(t.amount), 0),
      bundles: completed.filter((t) => t.type === "bundle").reduce((s, t) => s + Number(t.amount), 0),
      tips: completed.filter((t) => t.type === "tip").reduce((s, t) => s + Number(t.amount), 0),
    };
  },
};

// ============================================================
// CREATOR AUTH (persistent via localStorage, environment variable)
// ============================================================

const CREATOR_PASSWORD = process.env.REACT_APP_CREATOR_PASSWORD || "creator123";

export const creatorAuth = {
  login(password) {
    if (password === CREATOR_PASSWORD) {
      localStorage.setItem("sofia_creator_logged_in", "true");
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem("sofia_creator_logged_in");
  },

  isLoggedIn() {
    return localStorage.getItem("sofia_creator_logged_in") === "true";
  },
};