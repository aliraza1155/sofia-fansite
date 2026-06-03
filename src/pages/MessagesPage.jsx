// src/pages/MessagesPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { supabase, messageHelpers, contentHelpers } from "../lib/supabase";
import { MessageUnlockModal, TipModal } from "../components/PaymentModal";
import { AuthModal } from "../components/AuthModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

function useWindowSize() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export function MessagesPage() {
  const { fan } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showUnlock, setShowUnlock] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const w = useWindowSize();
  const isMobile = w < 640;

  const loadMessages = useCallback(async () => {
    if (!fan) return;
    try {
      const data = await messageHelpers.getThread(fan.id);
      setMessages(data);
    } catch (e) {
      console.error("Error loading messages:", e);
    }
  }, [fan]);

  useEffect(() => {
    if (!fan) return;
    loadMessages();
    const channel = supabase
      .channel(`messages:fan_id=eq.${fan.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `fan_id=eq.${fan.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fan, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !fan) return;
    setSending(true);
    try {
      const newMsg = await messageHelpers.sendFanMessage(fan.id, input.trim());
      setMessages(prev => [...prev, newMsg]);
      setInput("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString();
  };

  // ── NOT LOGGED IN ──
  if (!fan) {
    return (
      <>
        <Helmet>
          <title>Messages – Sofia Varelli | Direct Chat & Exclusive Replies</title>
          <meta name="description" content="Send a private message to Sofia Varelli. Get personal replies, exclusive locked media, and connect directly with the creator." />
          <link rel="canonical" href="https://sofiavarelli.com/messages" />
        </Helmet>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: isMobile ? 340 : 400, gap: 16, padding: "20px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 52 }}>💬</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, color: "#fff" }}>
            Send Sofia a Message
          </div>
          <div style={{ color: "#888", fontSize: 13, maxWidth: 280, lineHeight: 1.6 }}>
            Log in or sign up to message Sofia directly and get personal replies.
          </div>
          <button
            onClick={() => setShowAuth(true)}
            style={{
              background: `linear-gradient(135deg, ${PINK}, #c73460)`,
              border: "none", borderRadius: 12, padding: "14px 32px",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >Log In to Message</button>
          {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
        </div>
      </>
    );
  }

  const chatHeight = isMobile
    ? "calc(100dvh - 52px - 56px - 48px)"
    : "calc(100vh - 130px)";

  return (
    <>
      <Helmet>
        <title>Messages – Sofia Varelli | Direct Chat & Exclusive Replies</title>
        <meta name="description" content="Send a private message to Sofia Varelli. Get personal replies, exclusive locked media, and connect directly with the creator." />
        <link rel="canonical" href="https://sofiavarelli.com/messages" />
      </Helmet>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "240px 1fr",
        gap: 0, height: chatHeight,
        background: "#0a0a0a", borderRadius: isMobile ? 12 : 16,
        overflow: "hidden", border: `1px solid ${BORDER}`,
      }}>
        {/* Sidebar — hidden on mobile */}
        {!isMobile && (
          <div style={{ borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px", borderBottom: `1px solid ${BORDER}` }}>
              <input placeholder="Search messages..." style={{
                width: "100%", boxSizing: "border-box",
                background: "#1a1a1a", border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: "8px 12px", color: "#fff",
                fontSize: 12, outline: "none", fontFamily: "inherit",
              }} />
            </div>
            <div style={{
              padding: "14px 16px",
              background: "rgba(232,84,122,0.08)",
              borderLeft: `3px solid ${PINK}`,
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0, position: "relative",
                }}>
                  S
                  <div style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#22c55e", border: "2px solid #0a0a0a",
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Sofia Varelli</div>
                  <div style={{ color: "#888", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {messages.length > 0 ? messages[messages.length - 1].body || "📷 Media" : "Say hi!"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat area */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            padding: isMobile ? "12px 14px" : "14px 20px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: isMobile ? 32 : 36, height: isMobile ? 32 : 36,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0, position: "relative",
              }}>
                S
                <div style={{
                  position: "absolute", bottom: 1, right: 1,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#22c55e", border: "2px solid #0a0a0a",
                }} />
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? 13 : 14 }}>Sofia Varelli</div>
                <div style={{ color: "#22c55e", fontSize: 11 }}>● Online</div>
              </div>
            </div>
            <button onClick={() => setShowTip(true)} style={{
              background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.3)",
              borderRadius: isMobile ? 8 : 10, padding: isMobile ? "5px 10px" : "7px 14px",
              color: "#f5a623", cursor: "pointer", fontSize: isMobile ? 11 : 12, fontWeight: 700,
              fontFamily: "inherit",
            }}>💛 Tip</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "20px",
            display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16,
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#555", padding: "30px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                  Say hi to Sofia!<br />She loves hearing from her fans.
                </div>
              </div>
            )}

            {/* Group messages by date */}
            {messages.map((msg, idx) => {
              const isSofia = msg.sender === "sofia";
              const showDate = idx === 0 || formatDate(msg.created_at) !== formatDate(messages[idx - 1].created_at);
              return (
                <div key={msg.id}>
                  {showDate && (
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                      <span style={{
                        background: "#1a1a1a", border: `1px solid ${BORDER}`,
                        borderRadius: 20, padding: "3px 12px",
                        color: "#666", fontSize: 10, letterSpacing: 0.5,
                      }}>{formatDate(msg.created_at)}</span>
                    </div>
                  )}
                  <div style={{
                    display: "flex",
                    flexDirection: isSofia ? "row" : "row-reverse",
                    alignItems: "flex-end", gap: 8,
                  }}>
                    {isSofia && (
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${PINK}, #c73460)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, flexShrink: 0,
                      }}>S</div>
                    )}
                    <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 3 }}>
                      {msg.body && (
                        <div style={{
                          background: isSofia ? "#1e1e1e" : PINK,
                          borderRadius: isSofia ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
                          padding: isMobile ? "9px 12px" : "10px 14px",
                          color: "#fff", fontSize: isMobile ? 13 : 14, lineHeight: 1.5,
                        }}>{msg.body}</div>
                      )}
                      {isSofia && msg.locked_media_path && !msg.is_paid && (
                        <div
                          onClick={() => setShowUnlock(msg)}
                          style={{
                            background: "#1e1e1e", borderRadius: "12px 12px 12px 2px",
                            padding: "14px 16px", cursor: "pointer",
                            border: `1px solid ${BORDER}`, textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: 24, marginBottom: 6 }}>🔒</div>
                          <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4, fontSize: 13 }}>
                            Tap to unlock exclusive content
                          </div>
                          <div style={{ color: PINK, fontWeight: 700, fontSize: 15 }}>
                            ${msg.locked_media_price?.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {isSofia && msg.locked_media_path && msg.is_paid && (
                        <UnlockedMedia path={msg.locked_media_path} />
                      )}
                      <div style={{
                        color: "#555", fontSize: 10,
                        alignSelf: isSofia ? "flex-start" : "flex-end",
                      }}>
                        {formatTime(msg.created_at)}
                        {!isSofia && " ✓✓"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{
            padding: isMobile ? "10px 12px" : "14px 20px",
            borderTop: `1px solid ${BORDER}`,
            display: "flex", gap: 8, alignItems: "center", flexShrink: 0,
            background: "#0a0a0a",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1, background: "#1a1a1a", border: `1px solid ${BORDER}`,
                borderRadius: 24, padding: isMobile ? "10px 14px" : "12px 16px",
                color: "#fff", fontSize: isMobile ? 13 : 14, outline: "none", fontFamily: "inherit",
              }}
            />
            <button onClick={() => setShowTip(true)} style={{
              background: "none", border: "none", fontSize: 20, cursor: "pointer",
              padding: "4px", flexShrink: 0,
            }}>💛</button>
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              style={{
                background: input.trim() ? `linear-gradient(135deg, ${PINK}, #c73460)` : "#222",
                border: "none", borderRadius: 24,
                padding: isMobile ? "10px 16px" : "11px 20px",
                color: "#fff", fontWeight: 700,
                cursor: input.trim() ? "pointer" : "default",
                fontSize: isMobile ? 12 : 13, transition: "all 0.2s",
                fontFamily: "inherit", flexShrink: 0,
              }}
            >
              {sending ? "..." : isMobile ? "▶" : "SEND"}
            </button>
          </div>
        </div>

        {showUnlock && <MessageUnlockModal message={showUnlock} onClose={() => setShowUnlock(null)} />}
        {showTip && <TipModal onClose={() => setShowTip(false)} />}
      </div>
    </>
  );
}

function UnlockedMedia({ path }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    contentHelpers.getSignedUrl(path).then(setUrl).catch(() => {
      setUrl(contentHelpers.getPublicUrl("content", path));
    });
  }, [path]);
  if (!url) return <div style={{ color: "#555", fontSize: 12 }}>Loading...</div>;
  const isVideo = path.match(/\.(mp4|mov|webm)/i);
  return isVideo ? (
    <video src={url} controls style={{ maxWidth: 260, borderRadius: 12 }} />
  ) : (
    <img src={url} alt="" style={{ maxWidth: 260, borderRadius: 12 }} />
  );
}