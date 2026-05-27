// src/pages/MessagesPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase, messageHelpers, contentHelpers } from "../lib/supabase";
import { MessageUnlockModal, TipModal } from "../components/PaymentModal";
import { AuthModal } from "../components/AuthModal";

const PINK = "#E8547A";
const BORDER = "#2a2a2a";

export function MessagesPage() {
  const { fan } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showUnlock, setShowUnlock] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [creatorOnline, setCreatorOnline] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load messages from DB
  const loadMessages = useCallback(async () => {
    if (!fan) return;
    try {
      const data = await messageHelpers.getThread(fan.id);
      setMessages(data);
    } catch (e) {
      console.error("Error loading messages:", e);
    }
  }, [fan]);

  // Subscribe to real‑time inserts for this fan's thread
  useEffect(() => {
    if (!fan) return;

    loadMessages();

    const channel = supabase
      .channel(`messages:fan_id=eq.${fan.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `fan_id=eq.${fan.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fan, loadMessages]);

  // Presence / online status (optional – shows if creator is logged in)
  useEffect(() => {
    const presenceChannel = supabase.channel('creator-online');
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setCreatorOnline(!!state.creator);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // For demonstration, we assume the creator will track presence via a separate dashboard.
          // This is a placeholder; you can implement creator presence later.
        }
      });
    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  // Auto‑scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark message as read when it becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-id');
            if (messageId) {
              // Mark as read (if not already)
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId)
                .then();
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements = document.querySelectorAll('.message-bubble');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [messages]);

  // Send a new fan message
  const sendMessage = async () => {
    if (!input.trim() || !fan) return;
    setSending(true);
    try {
      const newMsg = await messageHelpers.sendFanMessage(fan.id, input.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  // Typing indicator handler
  const handleTyping = () => {
    if (!fan) return;
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing event (optional – can be ignored for now)
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1500);
  };

  // Helper: format timestamp
  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If not logged in, show auth prompt
  if (!fan) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 20,
        }}
      >
        <div style={{ fontSize: 48 }}>💬</div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            color: "#fff",
          }}
        >
          Send Sofia a Message
        </div>
        <div style={{ color: "#888", fontSize: 14, textAlign: "center" }}>
          Log in or sign up to message Sofia directly
        </div>
        <button
          onClick={() => setShowAuth(true)}
          style={{
            background: `linear-gradient(135deg, ${PINK}, #c73460)`,
            border: "none",
            borderRadius: 12,
            padding: "14px 32px",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Log In to Message
        </button>
        {showAuth && (
          <AuthModal
            mode="login"
            onClose={() => setShowAuth(false)}
            onSuccess={() => setShowAuth(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 0,
        height: "calc(100vh - 130px)",
        background: "#0a0a0a",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${BORDER}`,
      }}
    >
      {/* Sidebar - contact list */}
      <div style={{ borderRight: `1px solid ${BORDER}`, overflowY: "auto" }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${BORDER}` }}>
          <input
            placeholder="Search messages..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#1a1a1a",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "8px 12px",
              color: "#fff",
              fontSize: 12,
              outline: "none",
            }}
          />
        </div>

        {/* Sofia thread (only one contact) */}
        <div
          style={{
            padding: "14px 16px",
            background: "rgba(232,84,122,0.1)",
            borderLeft: `3px solid ${PINK}`,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: PINK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
                position: "relative",
              }}
            >
              S
              {creatorOnline && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 1,
                    right: 1,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "2px solid #0a0a0a",
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                Sofia Varelli
              </div>
              <div
                style={{
                  color: "#888",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {messages.length > 0
                  ? messages[messages.length - 1].body || "📷 Media"
                  : "Send a message to start"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: PINK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              S
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700 }}>Sofia Varelli</div>
              <div style={{ color: "#22c55e", fontSize: 12 }}>● Online</div>
            </div>
          </div>
          <button
            onClick={() => setShowTip(true)}
            style={{
              background: "rgba(245,166,35,0.1)",
              border: "1px solid #f5a623",
              borderRadius: 10,
              padding: "6px 14px",
              color: "#f5a623",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            💛 Send Tip
          </button>
        </div>

        {/* Messages list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#555", padding: "40px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
              <div>Say hi to Sofia! She loves hearing from her fans.</div>
            </div>
          )}
          {messages.map((msg) => {
            const isSofia = msg.sender === "sofia";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: isSofia ? "row" : "row-reverse",
                  alignItems: "flex-end",
                  gap: 10,
                }}
              >
                {isSofia && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: PINK,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    S
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "65%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  {msg.body && (
                    <div
                      className="message-bubble"
                      data-id={msg.id}
                      style={{
                        background: isSofia ? "#1e1e1e" : PINK,
                        borderRadius: isSofia
                          ? "12px 12px 12px 0"
                          : "12px 12px 0 12px",
                        padding: "10px 14px",
                        color: "#fff",
                        fontSize: 14,
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.body}
                    </div>
                  )}
                  {isSofia && msg.locked_media_path && !msg.is_paid && (
                    <div
                      onClick={() => setShowUnlock(msg)}
                      style={{
                        background: "#1e1e1e",
                        borderRadius: "12px 12px 12px 0",
                        padding: "16px",
                        cursor: "pointer",
                        border: `1px solid ${BORDER}`,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
                      <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>
                        Tap to unlock exclusive content
                      </div>
                      <div style={{ color: PINK, fontWeight: 700, fontSize: 16 }}>
                        ${msg.locked_media_price?.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {isSofia && msg.locked_media_path && msg.is_paid && (
                    <UnlockedMedia path={msg.locked_media_path} />
                  )}
                  <div
                    style={{
                      color: "#555",
                      fontSize: 11,
                      alignSelf: isSofia ? "flex-start" : "flex-end",
                    }}
                  >
                    {formatTime(msg.created_at)}
                    {!isSofia && " ✓✓"}
                    {msg.is_read && isSofia && <span>  (read)</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {/* Typing indicator placeholder */}
          {isTyping && (
            <div style={{ color: "#888", fontSize: 12, marginLeft: 42 }}>
              You are typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              background: "#1a1a1a",
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: "12px 16px",
              color: "#fff",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={() => setShowTip(true)}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
            }}
            title="Send tip"
          >
            💛
          </button>
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            style={{
              background: input.trim() ? PINK : "#333",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              color: "#fff",
              fontWeight: 700,
              cursor: input.trim() ? "pointer" : "default",
              fontSize: 13,
              transition: "all 0.2s",
            }}
          >
            SEND
          </button>
        </div>
      </div>

      {showUnlock && (
        <MessageUnlockModal message={showUnlock} onClose={() => setShowUnlock(null)} />
      )}
      {showTip && <TipModal onClose={() => setShowTip(false)} />}
    </div>
  );
}

// Helper component to display unlocked media (photo/video)
function UnlockedMedia({ path }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    contentHelpers
      .getSignedUrl(path)
      .then(setUrl)
      .catch(() => {
        setUrl(contentHelpers.getPublicUrl("content", path));
      });
  }, [path]);

  if (!url) return <div style={{ color: "#555", fontSize: 12 }}>Loading...</div>;
  const isVideo = path.match(/\.(mp4|mov|webm)/i);
  return isVideo ? (
    <video src={url} controls style={{ maxWidth: 280, borderRadius: 12 }} />
  ) : (
    <img src={url} alt="" style={{ maxWidth: 280, borderRadius: 12 }} />
  );
}