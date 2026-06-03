// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase, authHelpers, subscriptionHelpers, contentHelpers } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [fan, setFan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial session
    authHelpers.getSession().then((session) => {
      if (session?.user) loadFanData(session.user);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = authHelpers.onAuthStateChange(async (_event, session) => {
      if (session?.user) await loadFanData(session.user);
      else {
        setFan(null);
        setProfile(null);
        setSubscription(null);
        setUnlockedIds([]);
        setLoading(false);
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  async function loadFanData(user) {
    setFan(user);
    try {
      // Load profile
      const { data: prof } = await supabase
        .from("fan_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(prof);

      // Load subscription
      const sub = await subscriptionHelpers.getActive(user.id);
      setSubscription(sub);

      // Load unlocked content
      const ids = await contentHelpers.getUnlockedIds(user.id);
      setUnlockedIds(ids);
    } catch (e) {
      console.error("Error loading fan data:", e);
    }
    setLoading(false);
  }

  async function signUp(email, password, fullName) {
    const data = await authHelpers.signUp(email, password, fullName);
    return data;
  }

  async function signIn(email, password) {
    const data = await authHelpers.signIn(email, password);
    return data;
  }

  async function signOut() {
    await authHelpers.signOut();
  }

  async function resetPassword(email) {
    await authHelpers.resetPassword(email);
  }

  async function updatePassword(newPassword) {
    await authHelpers.updatePassword(newPassword);
  }

  function hasAccess(contentItem) {
    if (!contentItem?.is_locked) return true;
    if (subscription?.status === "active") return true;
    if (unlockedIds.includes(contentItem.id)) return true;
    return false;
  }

  async function refreshSubscription() {
    if (!fan) return;
    const sub = await subscriptionHelpers.getActive(fan.id);
    setSubscription(sub);
  }

  async function refreshUnlocked() {
    if (!fan) return;
    const ids = await contentHelpers.getUnlockedIds(fan.id);
    setUnlockedIds(ids);
  }

  return (
    <AuthContext.Provider value={{
      fan,
      profile,
      subscription,
      unlockedIds,
      loading,
      isSubscribed: subscription?.status === "active",
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      hasAccess,
      refreshSubscription,
      refreshUnlocked,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}