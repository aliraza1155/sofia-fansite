import { useState } from "react";
import { useMedia } from "../context/MediaContext";
import {
  PINK, PINK_LIGHT, CARD_BG, BORDER, TEXT_MUTED, TEXT_DIM,
  inputStyle, LockIcon, PlayIcon, HeartIcon, Avatar, PinkButton,
} from "../components/ui";

// ─── JOIN PANEL ──────────────────────────────────────────────────────────────
export function JoinPanel({ compact = false }) {
  return (
    <div style={{ background: CARD_BG, borderRadius: 16, padding: compact ? "20px" : "28px", border: `1px solid ${BORDER}` }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h3 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: compact ? 18 : 22, margin: "0 0 4px" }}>
          JOIN SOFIA <HeartIcon filled />
        </h3>
        <p style={{ color: TEXT_MUTED, fontSize: 12, margin: 0 }}>GET FULL ACCESS TO MY EXCLUSIVE CONTENT</p>
      </div>
      <input placeholder="Full Name" style={inputStyle} />
      <input placeholder="Email Address" style={{ ...inputStyle, marginTop: 10 }} />
      <div style={{ background: "#222", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <LockIcon size={16} color={PINK} />
        <div>
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Password is auto-generated</div>
          <div style={{ color: TEXT_MUTED, fontSize: 11 }}>A secure password will be sent to your email</div>
        </div>
      </div>
      {!compact && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: TEXT_MUTED, fontSize: 11, textAlign: "center", marginBottom: 10 }}>CHOOSE YOUR PLAN</div>
          {[
            { price: "$19.99 / month", note: "Cancel anytime", popular: true },
            { price: "$49.99 / 3 months", note: "Best Value" },
            { price: "$89.99 / 6 months", note: "Limited Time Offer" },
          ].map((plan, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              border: `1px solid ${i === 0 ? PINK : BORDER}`, borderRadius: 10, marginBottom: 8,
              cursor: "pointer", background: i === 0 ? "rgba(232,84,122,0.08)" : "transparent",
              position: "relative",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${i === 0 ? PINK : BORDER}`, background: i === 0 ? PINK : "transparent", flexShrink: 0 }} />
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{plan.price}</div>
                <div style={{ color: TEXT_MUTED, fontSize: 11 }}>{plan.note}</div>
              </div>
              {plan.popular && (
                <div style={{ position: "absolute", top: -8, right: 10, background: PINK, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5 }}>MOST POPULAR</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <div style={{ width: 36, height: 20, borderRadius: 10, background: PINK, display: "flex", alignItems: "center", padding: "0 3px", justifyContent: "flex-end" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
        </div>
        <span style={{ color: TEXT_MUTED, fontSize: 11 }}>I agree to the <span style={{ color: PINK }}>Terms of Use</span> and confirm I am 18+</span>
      </div>
      <button style={{
        width: "100%", background: `linear-gradient(135deg, ${PINK}, ${PINK_LIGHT})`,
        color: "#fff", border: "none", borderRadius: 12, padding: "14px",
        fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 16,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        fontFamily: "'Playfair Display', serif", letterSpacing: 0.5,
      }}>
        <LockIcon size={16} color="#fff" /> JOIN NOW
      </button>
      <div style={{ textAlign: "center", color: TEXT_DIM, fontSize: 10, marginTop: 8 }}>SECURE & DISCREET</div>
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
export function HomePage() {
  const { media } = useMedia();
  const { profile, photos } = media;
  const previewPhotos = photos.filter(p => !p.locked).slice(0, 6);
  const lockedCount = Math.max(0, 9 - previewPhotos.length);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 360px", gap: 24, alignItems: "start" }}>
        {/* Hero */}
        <div style={{
          background: profile.coverUrl
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url(${profile.coverUrl}) center/cover`
            : `linear-gradient(160deg, #1a0a10 0%, #0d0d0d 100%)`,
          borderRadius: 16, padding: "40px 32px", minHeight: 500,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ color: PINK, fontSize: 12, letterSpacing: 3, fontWeight: 600, margin: "0 0 8px" }}>WELCOME TO</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 42, lineHeight: 1.1, margin: "0 0 6px", fontWeight: 700 }}>
              {profile.name.split(" ")[0].toUpperCase()}'S
            </h1>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: PINK, fontSize: 38, fontStyle: "italic", margin: "0 0 20px", fontWeight: 400 }}>
              Private World
            </h1>
            <p style={{ color: TEXT_MUTED, fontSize: 13, lineHeight: 1.7, maxWidth: 260, margin: "0 0 24px" }}>
              Exclusive content. Real connection. Be part of my inner circle and get access to photos, videos, and more.
            </p>
            {["Exclusive Photos & Videos", "Direct Messages", "Behind the Scenes", "New Content Weekly", "Special Offers & Discounts"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: PINK }} />
                <span style={{ color: "#ccc", fontSize: 12 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials="SV" size={32} bg={PINK} src={profile.avatarUrl} />
            <div>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Join thousands of fans</div>
              <div style={{ color: TEXT_MUTED, fontSize: 11 }}>already inside {profile.name.split(" ")[0]}'s world</div>
            </div>
            <div style={{ marginLeft: "auto", background: PINK, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>10K+</div>
          </div>
        </div>

        {/* Preview grid */}
        <div>
          <div style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>
            FREE PREVIEW — {previewPhotos.length} photos
          </div>
          {previewPhotos.length === 0 && photos.length === 0 ? (
            <div style={{ background: "#111", borderRadius: 12, padding: "60px 24px", textAlign: "center" }}>
              <div style={{ color: TEXT_DIM, fontSize: 13 }}>No photos uploaded yet.</div>
              <div style={{ color: TEXT_DIM, fontSize: 11, marginTop: 4 }}>Visit the Creator Dashboard to upload.</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, borderRadius: 12, overflow: "hidden" }}>
                {previewPhotos.map(p => (
                  <div key={p.id} style={{ aspectRatio: "1", overflow: "hidden" }}>
                    <img src={p.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ))}
                {Array.from({ length: lockedCount }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: "1", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LockIcon size={22} color={TEXT_DIM} />
                  </div>
                ))}
              </div>
              <button style={{
                width: "100%", marginTop: 8, background: "transparent", border: `1px solid ${BORDER}`,
                color: TEXT_MUTED, borderRadius: 10, padding: "11px", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <LockIcon size={14} color={TEXT_MUTED} /> UNLOCK ALL PHOTOS & VIDEOS
              </button>
            </>
          )}
        </div>

        <JoinPanel />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginTop: 24 }}>
        {[
          { icon: "🔒", title: "100% EXCLUSIVE", desc: "Content you won't find anywhere else" },
          { icon: "💬", title: "DIRECT ACCESS", desc: "Message me and get personal replies" },
          { icon: "📅", title: "NEW CONTENT WEEKLY", desc: "Fresh photos & videos added regularly" },
          { icon: "🛡️", title: "SAFE & SECURE", desc: "Your privacy is my top priority" },
        ].map((item, i) => (
          <div key={i} style={{ background: CARD_BG, borderRadius: 12, padding: "16px", border: `1px solid ${BORDER}`, textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ color: PINK, fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{item.title}</div>
            <div style={{ color: TEXT_MUTED, fontSize: 11 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GALLERY PAGE ─────────────────────────────────────────────────────────────
export function GalleryPage() {
  const { media } = useMedia();
  const [activeFilter, setActiveFilter] = useState("All Photos");
  const filters = ["All Photos", "Lingerie", "Bikini", "Behind the Scenes", "Personal", "Favorites"];
  const filtered = activeFilter === "All Photos" ? media.photos : media.photos.filter(p => p.cat === activeFilter);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24 }}>
      <div>
        <div style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>GALLERY</div>
        {filters.map(f => (
          <div key={f} onClick={() => setActiveFilter(f)} style={{
            padding: "9px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
            color: activeFilter === f ? "#fff" : TEXT_MUTED,
            background: activeFilter === f ? "rgba(232,84,122,0.15)" : "transparent",
            borderLeft: activeFilter === f ? `2px solid ${PINK}` : "2px solid transparent",
            marginBottom: 2, transition: "all 0.2s",
          }}>{f}</div>
        ))}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 20, margin: 0 }}>
            ALL PHOTOS <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 400 }}>({filtered.length})</span>
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            {["Newest", "Popular", "A - Z"].map((s, i) => (
              <button key={s} style={{
                background: i === 0 ? PINK : "transparent", color: i === 0 ? "#fff" : TEXT_MUTED,
                border: `1px solid ${i === 0 ? PINK : BORDER}`, borderRadius: 20, padding: "5px 14px",
                fontSize: 11, cursor: "pointer", fontWeight: 600,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: TEXT_DIM, padding: "80px 0", fontSize: 13 }}>
            No photos in this category yet.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {filtered.map(photo => (
              <div key={photo.id} style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden", background: "#1a1a1a", position: "relative", cursor: "pointer" }}>
                {!photo.locked ? (
                  <img src={photo.src} alt={photo.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <LockIcon size={24} color={TEXT_DIM} />
                    <span style={{ color: TEXT_DIM, fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>MEMBERS ONLY</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {filtered.length > 0 && (
          <button style={{ width: "100%", marginTop: 16, background: "transparent", border: `1px solid ${BORDER}`, color: TEXT_MUTED, borderRadius: 10, padding: "13px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <LockIcon size={14} color={TEXT_MUTED} /> UNLOCK ALL PHOTOS
          </button>
        )}
      </div>
    </div>
  );
}

// ─── VIDEOS PAGE ──────────────────────────────────────────────────────────────
export function VideosPage() {
  const { media } = useMedia();
  const [activeFilter, setActiveFilter] = useState("All Videos");
  const [playing, setPlaying] = useState(null);
  const cats = ["All Videos", "Solo Videos", "Bikini Videos", "Behind the Scenes", "Custom Videos", "Favorites"];
  const filtered = activeFilter === "All Videos" ? media.videos : media.videos.filter(v => v.cat === activeFilter);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24 }}>
      <div>
        <div style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>VIDEOS</div>
        {cats.map(c => (
          <div key={c} onClick={() => setActiveFilter(c)} style={{
            padding: "9px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
            color: activeFilter === c ? "#fff" : TEXT_MUTED,
            background: activeFilter === c ? "rgba(232,84,122,0.15)" : "transparent",
            borderLeft: activeFilter === c ? `2px solid ${PINK}` : "2px solid transparent",
            marginBottom: 2,
          }}>{c}</div>
        ))}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 20, margin: 0 }}>
            ALL VIDEOS <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 400 }}>({filtered.length})</span>
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            {["Newest", "Popular", "Longest"].map((s, i) => (
              <button key={s} style={{
                background: i === 0 ? PINK : "transparent", color: i === 0 ? "#fff" : TEXT_MUTED,
                border: `1px solid ${i === 0 ? PINK : BORDER}`, borderRadius: 20, padding: "5px 14px",
                fontSize: 11, cursor: "pointer", fontWeight: 600,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: TEXT_DIM, padding: "80px 0", fontSize: 13 }}>
            No videos in this category yet.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {filtered.map(v => (
              <div key={v.id} style={{ borderRadius: 10, overflow: "hidden", background: "#1a1a1a", cursor: "pointer" }}>
                <div style={{ aspectRatio: "16/9", background: "#111", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                  onClick={() => setPlaying(playing === v.id ? null : v.id)}>
                  {v.locked ? (
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <LockIcon size={24} color={TEXT_DIM} />
                      <span style={{ color: TEXT_DIM, fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>MEMBERS ONLY</span>
                    </div>
                  ) : playing === v.id ? (
                    <video src={v.src} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      {v.thumb && <img src={v.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute" }} />}
                      <div style={{ position: "relative", zIndex: 1 }}><PlayIcon /></div>
                      {v.duration && v.duration !== "0:00" && (
                        <div style={{ position: "absolute", bottom: 6, right: 8, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                          {v.duration}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div style={{ padding: "8px 12px" }}>
                  <div style={{ color: "#ccc", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                  <div style={{ color: TEXT_DIM, fontSize: 10, marginTop: 2 }}>{v.cat}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
export function AboutPage() {
  const { media } = useMedia();
  const { profile } = media;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 40, alignItems: "start" }}>
      <div style={{ borderRadius: 16, overflow: "hidden", background: "#1a1a1a" }}>
        {profile.avatarUrl
          ? <img src={profile.avatarUrl} alt={profile.name} style={{ width: "100%", display: "block" }} />
          : <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_DIM, fontSize: 64 }}>👤</div>
        }
      </div>
      <div>
        <div style={{ color: TEXT_MUTED, fontSize: 10, letterSpacing: 2, fontWeight: 600, marginBottom: 12 }}>ABOUT ME</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 36, margin: "0 0 8px" }}>
          Hi, I'm {profile.name.split(" ")[0]} <span style={{ color: PINK }}>♥</span>
        </h2>
        {profile.bio.split("\n\n").map((para, i) => (
          <p key={i} style={{ color: "#aaa", fontSize: 13, lineHeight: 1.8, marginBottom: 14 }}>{para}</p>
        ))}
        <p style={{ fontFamily: "'Playfair Display', serif", color: PINK, fontSize: 18, fontStyle: "italic", marginBottom: 32 }}>
          {profile.tagline}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
          {[
            { title: "Personal Connection", desc: "I reply to messages and love getting to know you." },
            { title: "New Content Weekly", desc: "Fresh, exclusive content added every week." },
            { title: "100% Exclusive", desc: "Everything here is made just for my fans." },
          ].map((item, i) => (
            <div key={i} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px" }}>
              <div style={{ color: PINK, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
              <div style={{ color: TEXT_MUTED, fontSize: 11, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "MY STYLE", value: profile.style },
            { label: "FAVORITE THINGS", value: profile.favorites },
            { label: "FUN FACT", value: profile.funFact },
          ].map((item, i) => (
            <div key={i} style={{ borderTop: `2px solid ${PINK}`, paddingTop: 12 }}>
              <div style={{ color: TEXT_MUTED, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
              <div style={{ color: "#ccc", fontSize: 12 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MESSAGES PAGE ────────────────────────────────────────────────────────────
const SAMPLE_MESSAGES = [
  { id: 1, name: "Sofia Varelli", avatar: "SV", time: "2m", preview: "Hey handsome 🧡", online: true, isCreator: true },
  { id: 2, name: "James", avatar: "J", time: "10m", preview: "Can't wait for more content!" },
  { id: 3, name: "Mike", avatar: "M", time: "1h", preview: "You look incredible" },
  { id: 4, name: "Alex", avatar: "A", time: "2h", preview: "Just joined! Hi Sofia" },
  { id: 5, name: "Daniel", avatar: "D", time: "5h", preview: "Is there new content today?" },
];

const SAMPLE_CHAT = [
  { from: "sofia", text: "Hey handsome 🧡", time: "2:30 PM" },
  { from: "user", text: "Hi Sofia! You're so amazing", time: "2:31 PM" },
  { from: "sofia", text: "Thank you! I just uploaded something really special for my fans...", time: "2:32 PM", locked: true },
  { from: "user", text: "I can't wait to see it!", time: "2:32 PM" },
];

export function MessagesPage() {
  const { media } = useMedia();
  const [active, setActive] = useState(1);
  const [input, setInput] = useState("");
  const BORDER_COLOR = BORDER;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER_COLOR}`, overflow: "hidden", height: 520 }}>
      <div style={{ borderRight: `1px solid ${BORDER_COLOR}`, overflowY: "auto" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER_COLOR}` }}>
          <input placeholder="Search messages..." style={{ ...inputStyle, background: "#111", fontSize: 12, padding: "8px 12px" }} />
        </div>
        {SAMPLE_MESSAGES.map(msg => (
          <div key={msg.id} onClick={() => setActive(msg.id)} style={{
            padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
            background: active === msg.id ? "rgba(232,84,122,0.12)" : "transparent",
            borderLeft: active === msg.id ? `2px solid ${PINK}` : "2px solid transparent",
          }}>
            <div style={{ position: "relative" }}>
              <Avatar
                initials={msg.avatar} size={36}
                bg={msg.isCreator ? PINK : "#333"}
                src={msg.isCreator ? media.profile.avatarUrl : null}
              />
              {msg.online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: "#4caf50", border: "2px solid #181818" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{msg.name}</span>
                <span style={{ color: TEXT_DIM, fontSize: 10 }}>{msg.time}</span>
              </div>
              <div style={{ color: TEXT_MUTED, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.preview}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER_COLOR}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Avatar initials="SV" size={36} bg={PINK} src={media.profile.avatarUrl} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: "#4caf50", border: "2px solid #181818" }} />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{media.profile.name}</div>
            <div style={{ color: "#4caf50", fontSize: 10 }}>Online</div>
          </div>
          <div style={{ marginLeft: "auto", color: TEXT_MUTED, fontSize: 18, cursor: "pointer" }}>···</div>
        </div>
        <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {SAMPLE_CHAT.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: msg.from === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
              {msg.from === "sofia" && <Avatar initials="SV" size={28} bg={PINK} src={media.profile.avatarUrl} />}
              <div>
                {msg.locked ? (
                  <div style={{ background: "#222", border: `1px solid ${BORDER_COLOR}`, borderRadius: 12, padding: "12px 16px", maxWidth: 220, cursor: "pointer" }}>
                    <div style={{ color: TEXT_MUTED, fontSize: 11, marginBottom: 6 }}>{msg.text}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: PINK, fontSize: 11, fontWeight: 600 }}>
                      <LockIcon size={12} color={PINK} /> Tap to unlock exclusive content
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: msg.from === "user" ? PINK : "#2a2a2a",
                    borderRadius: msg.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    padding: "10px 14px", maxWidth: 260, color: "#fff", fontSize: 12, lineHeight: 1.5,
                  }}>{msg.text}</div>
                )}
                <div style={{ color: TEXT_DIM, fontSize: 10, marginTop: 3, textAlign: msg.from === "user" ? "right" : "left" }}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER_COLOR}`, display: "flex", alignItems: "center", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." style={{ ...inputStyle, flex: 1, padding: "10px 14px", fontSize: 12 }} />
          <PinkButton small onClick={() => setInput("")}>SEND</PinkButton>
        </div>
      </div>
    </div>
  );
}
