// src/components/CreatorDashboard.jsx
import { useState, useRef, useEffect } from "react";
import { creatorAuth } from "../lib/supabase";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

const PINK = "#E8547A";
const DARK_BG = "#0D0D0D";
const CARD_BG = "#141414";
const BORDER = "#2a2a2a";
const TEXT_MUTED = "#888";
const TEXT_DIM = "#555";

function useWindowSize() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

const readFileAsDataURL = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target.result);
  reader.readAsDataURL(file);
});

const generateImageThumbnail = (file) => new Promise((resolve) => {
  if (!file.type.startsWith("image/")) { resolve(null); return; }
  const img = new Image();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  img.onload = () => {
    let [w, h] = [img.width, img.height];
    const max = 400;
    if (w > h && w > max) { h = (h * max) / w; w = max; }
    else if (h > max) { w = (w * max) / h; h = max; }
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    canvas.toBlob((blob) => resolve(new File([blob], `thumb_${file.name}`, { type: "image/jpeg" })), "image/jpeg", 0.8);
  };
  img.src = URL.createObjectURL(file);
});

const generateVideoThumbnail = (file) => new Promise((resolve) => {
  if (!file.type.startsWith("video/")) { resolve(null); return; }
  const video = document.createElement("video");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  video.preload = "metadata"; video.muted = true; video.playsInline = true;
  video.onloadeddata = () => { video.currentTime = 0.5; };
  video.onseeked = () => {
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => resolve(new File([blob], `thumb_${file.name.split(".")[0]}.jpg`, { type: "image/jpeg" })), "image/jpeg", 0.8);
  };
  video.onerror = () => resolve(null);
  video.src = URL.createObjectURL(file);
});

// ── LOGIN ──
function CreatorLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (creatorAuth.login(password)) onLogin();
    else setError("Incorrect password.");
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: DARK_BG, padding: 20 }}>
      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "40px 32px", width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>⚙️</div>
          <h2 style={{ color: "#fff", fontSize: 24, margin: 0 }}>Creator Access</h2>
          <p style={{ color: TEXT_MUTED, fontSize: 13, marginTop: 6 }}>Enter your password</p>
        </div>
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ width: "100%", boxSizing: "border-box", padding: "14px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 12, color: "#fff", marginBottom: 14, fontSize: 14, outline: "none" }}
        />
        {error && <div style={{ color: "#f66", marginBottom: 12, fontSize: 13 }}>{error}</div>}
        <button onClick={submit} style={{ width: "100%", background: `linear-gradient(135deg, ${PINK}, #c73460)`, border: "none", padding: "14px", borderRadius: 12, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          Enter Dashboard
        </button>
      </div>
    </div>
  );
}

// ── MAIN ──
export default function CreatorDashboard({ onExit }) {
  const [loggedIn, setLoggedIn] = useState(creatorAuth.isLoggedIn());
  const [activeTab, setActiveTab] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState("photo");
  const [uploadAccess, setUploadAccess] = useState("locked");
  const [files, setFiles] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const fileRef = useRef();
  const w = useWindowSize();
  const isMobile = w < 768;

  const fetchContent = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content?order=sort_order.asc`, {
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      });
      if (!res.ok) throw new Error("Failed to fetch content");
      setContentList(await res.json());
    } catch (err) { console.error(err); alert("Failed to load content"); }
    finally { setLoadingContent(false); }
  };

  const fetchBundles = async () => {
    setLoadingBundles(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/bundles?select=*,bundle_items(content_id)`, {
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bundles");
      setBundles(await res.json());
    } catch (err) { console.error(err); alert("Failed to load bundles"); }
    finally { setLoadingBundles(false); }
  };

  useEffect(() => {
    if (loggedIn && activeTab === "manage") fetchContent();
    if (loggedIn && activeTab === "bundles") fetchBundles();
  }, [loggedIn, activeTab]);

  if (!loggedIn) return <CreatorLogin onLogin={() => setLoggedIn(true)} />;

  const checkDuplicate = async (fileName, fileType) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/content?title=eq.${encodeURIComponent(fileName)}&type=eq.${fileType}`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });
    if (!res.ok) return false;
    return (await res.json()).length > 0;
  };

  const handleFileSelect = async (e) => {
    const selected = Array.from(e.target.files);
    const newFiles = await Promise.all(selected.map(async (file) => ({
      file,
      preview: file.type.startsWith("image/") ? await readFileAsDataURL(file) : null,
      status: "pending", progress: 0,
    })));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  const uploadAll = async () => {
    if (!files.length) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const { file } = files[i];
      const ext = file.name.split(".").pop();
      const path = `${type}s/${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`;
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "uploading", progress: 20 } : f));
      try {
        const isDuplicate = await checkDuplicate(file.name, type);
        if (isDuplicate && !window.confirm(`"${file.name}" already exists. Overwrite?`)) {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error", error: "Skipped" } : f));
          continue;
        }
        const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/object/content/${path}`, {
          method: "POST", headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": file.type }, body: file,
        });
        if (!storageRes.ok) throw new Error(`Storage error ${storageRes.status}`);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 50 } : f));

        let thumbnailPath = null;
        const thumbFile = type === "photo" ? await generateImageThumbnail(file) : await generateVideoThumbnail(file);
        if (thumbFile) {
          const thumbPath = `${type}s/${Date.now()}_thumb_${Math.random().toString(36).substring(2, 10)}.jpg`;
          const thumbUpload = await fetch(`${SUPABASE_URL}/storage/v1/object/thumbnails/${thumbPath}`, {
            method: "POST", headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": thumbFile.type }, body: thumbFile,
          });
          if (thumbUpload.ok) thumbnailPath = thumbPath;
        }
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 80 } : f));

        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/content`, {
          method: "POST",
          headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({ type, storage_path: path, thumbnail_path: thumbnailPath, title: file.name, category: type === "photo" ? "Personal" : "Solo Videos", is_locked: uploadAccess === "locked", ppv_price: null, sort_order: contentList.length }),
        });
        if (!insertRes.ok) throw new Error(`Insert error ${insertRes.status}`);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "success", progress: 100 } : f));
      } catch (err) {
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error", error: err.message } : f));
      }
    }
    setUploading(false);
    setTimeout(() => setFiles([]), 2000);
  };

  const updateItem = async (id, updates) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Update failed");
      setContentList(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      setEditingItem(null);
    } catch (err) { alert(err.message); }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      if (item.storage_path) await fetch(`${SUPABASE_URL}/storage/v1/object/content/${item.storage_path}`, { method: "DELETE", headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
      if (item.thumbnail_path) await fetch(`${SUPABASE_URL}/storage/v1/object/thumbnails/${item.thumbnail_path}`, { method: "DELETE", headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
      await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.${item.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY } });
      setContentList(prev => prev.filter(i => i.id !== item.id));
    } catch (err) { alert(err.message); }
  };

  const TABS = [
    { key: "upload", label: "📤 Upload" },
    { key: "manage", label: "📋 Manage" },
    { key: "bundles", label: "🎁 Bundles" },
  ];

  return (
    <div style={{ background: DARK_BG, minHeight: "100vh", padding: isMobile ? "16px 14px 80px" : "24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ color: "#fff", fontSize: isMobile ? 20 : 28, fontWeight: 700, margin: 0 }}>⚙️ Creator Studio</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onExit} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, padding: isMobile ? "6px 12px" : "8px 18px", borderRadius: 40, color: "#aaa", cursor: "pointer", fontSize: isMobile ? 11 : 13 }}>← Exit</button>
            <button onClick={() => { creatorAuth.logout(); onExit(); }} style={{ background: "transparent", border: `1px solid ${BORDER}`, padding: isMobile ? "6px 12px" : "8px 18px", borderRadius: 40, color: "#888", cursor: "pointer", fontSize: isMobile ? 11 : 13 }}>Log Out</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: isMobile ? 4 : 20, marginBottom: 24, borderBottom: `1px solid ${BORDER}`, paddingBottom: 10 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: "none", border: "none",
              fontSize: isMobile ? 13 : 15, fontWeight: activeTab === tab.key ? 700 : 400,
              color: activeTab === tab.key ? PINK : TEXT_MUTED,
              cursor: "pointer", padding: isMobile ? "6px 8px" : "8px 0",
              borderBottom: activeTab === tab.key ? `2px solid ${PINK}` : "2px solid transparent",
              marginBottom: -11, fontFamily: "inherit",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
            <div style={{ background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "18px" : "24px" }}>
              <h2 style={{ color: "#fff", fontSize: 18, marginTop: 0, marginBottom: 18 }}>Upload Settings</h2>

              <div style={{ marginBottom: 20 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 11, letterSpacing: 1, display: "block", marginBottom: 8 }}>MEDIA TYPE</label>
                <div style={{ display: "flex", gap: 8, background: "#1a1a1a", borderRadius: 12, padding: 4 }}>
                  {[["photo","📷 Photos"],["video","🎬 Videos"]].map(([t, label]) => (
                    <button key={t} onClick={() => setType(t)} style={{
                      flex: 1, padding: "10px", borderRadius: 10, border: "none",
                      background: type === t ? PINK : "transparent",
                      color: type === t ? "#fff" : TEXT_MUTED,
                      fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 11, letterSpacing: 1, display: "block", marginBottom: 8 }}>ACCESS LEVEL</label>
                <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 4, display: "flex", gap: 8 }}>
                  {[["locked","🔒 Members Only"],["free","🔓 Free Preview"]].map(([a, label]) => (
                    <button key={a} onClick={() => setUploadAccess(a)} style={{
                      flex: 1, padding: "10px", borderRadius: 10, border: "none",
                      background: uploadAccess === a ? PINK : "transparent",
                      color: uploadAccess === a ? "#fff" : TEXT_MUTED,
                      fontWeight: 600, cursor: "pointer", fontSize: isMobile ? 11 : 13, fontFamily: "inherit",
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${BORDER}`, borderRadius: 16,
                  padding: isMobile ? "28px 16px" : "36px 20px",
                  textAlign: "center", cursor: "pointer",
                  background: "rgba(255,255,255,0.01)", marginBottom: 20,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = PINK}
                onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>{type === "photo" ? "🖼️" : "🎥"}</div>
                <div style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>
                  {isMobile ? "Tap to select files" : "Click or drag files here"}
                </div>
                <div style={{ color: TEXT_DIM, fontSize: 12 }}>
                  {type === "photo" ? "JPG, PNG, WEBP up to 20MB" : "MP4, MOV up to 500MB"}
                </div>
                <input ref={fileRef} type="file" accept={type === "photo" ? "image/*" : "video/*"}
                  multiple style={{ display: "none" }} onChange={handleFileSelect} />
              </div>

              {files.length > 0 && (
                <button onClick={uploadAll} disabled={uploading} style={{
                  width: "100%",
                  background: uploading ? "#333" : `linear-gradient(135deg, ${PINK}, #c73460)`,
                  border: "none", padding: "14px", borderRadius: 14,
                  color: "#fff", fontWeight: 700,
                  cursor: uploading ? "not-allowed" : "pointer", fontSize: 14,
                }}>
                  {uploading ? "Uploading..." : `🚀 Upload ${files.length} file(s)`}
                </button>
              )}
            </div>

            {/* Queue */}
            <div style={{ background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "18px" : "24px" }}>
              <h2 style={{ color: "#fff", fontSize: 18, marginBottom: 16, marginTop: 0 }}>Upload Queue</h2>
              {files.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", color: TEXT_DIM }}>
                  <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.5 }}>📂</div>
                  <div>No files selected</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {files.map((item, idx) => (
                    <div key={idx} style={{ background: "#1a1a1a", borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center", border: `1px solid ${BORDER}` }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: "#111", flexShrink: 0 }}>
                        {item.preview ? <img src={item.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{type === "photo" ? "🖼️" : "🎬"}</div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontWeight: 500, fontSize: 12, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.file.name}</div>
                        <div style={{ height: 3, background: "#2a2a2a", borderRadius: 2 }}>
                          <div style={{ width: `${item.progress}%`, height: 3, borderRadius: 2, background: item.status === "error" ? "#f00" : PINK, transition: "width 0.3s" }} />
                        </div>
                        <div style={{ fontSize: 10, color: item.status === "error" ? "#f66" : TEXT_MUTED, marginTop: 3 }}>
                          {item.status === "pending" && "Waiting..."}
                          {item.status === "uploading" && "Uploading..."}
                          {item.status === "success" && "✓ Done"}
                          {item.status === "error" && `Error: ${item.error}`}
                        </div>
                      </div>
                      <button onClick={() => removeFile(idx)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div style={{ background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "16px" : "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ color: "#fff", fontSize: 18, margin: 0 }}>All Content</h2>
              <button onClick={fetchContent} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px", color: "#fff", cursor: "pointer", fontSize: 12 }}>↻ Refresh</button>
            </div>
            {loadingContent ? (
              <div style={{ textAlign: "center", padding: 50, color: TEXT_MUTED }}>Loading...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {contentList.map(item => (
                  <div key={item.id} style={{ background: "#1a1a1a", borderRadius: 12, overflow: "hidden", border: `1px solid ${BORDER}` }}>
                    <div style={{ aspectRatio: "3/4", background: "#111", position: "relative" }}>
                      {item.thumbnail_path ? (
                        <img src={`${SUPABASE_URL}/storage/v1/object/public/thumbnails/${item.thumbnail_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.3 }}>{item.type === "photo" ? "🖼️" : "🎬"}</div>
                      )}
                      <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4 }}>
                        <button onClick={() => setEditingItem(item)} style={{ background: "rgba(0,0,0,0.75)", border: "none", borderRadius: 6, padding: "4px 7px", color: "#fff", cursor: "pointer", fontSize: 12 }}>✏️</button>
                        <button onClick={() => deleteItem(item)} style={{ background: "rgba(180,0,0,0.75)", border: "none", borderRadius: 6, padding: "4px 7px", color: "#fff", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                      </div>
                      <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(0,0,0,0.65)", borderRadius: 4, padding: "2px 6px", fontSize: 9, color: "#fff" }}>
                        {item.is_locked ? "🔒" : "🔓"}
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{ color: "#fff", fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                      <div style={{ color: TEXT_MUTED, fontSize: 10, marginTop: 2 }}>{item.category || "Uncategorized"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bundles Tab */}
        {activeTab === "bundles" && (
          <div style={{ background: CARD_BG, borderRadius: 20, border: `1px solid ${BORDER}`, padding: isMobile ? "16px" : "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ color: "#fff", fontSize: 18, margin: 0 }}>Bundles</h2>
              <button onClick={() => setEditingBundle({})} style={{ background: PINK, border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>+ New Bundle</button>
            </div>
            {loadingBundles ? <div style={{ textAlign: "center", padding: 50, color: TEXT_MUTED }}>Loading...</div> : bundles.length === 0 ? (
              <div style={{ textAlign: "center", padding: 50, color: TEXT_MUTED }}>No bundles yet.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {bundles.map(bundle => (
                  <div key={bundle.id} style={{ background: "#1a1a1a", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                      <div>
                        <h3 style={{ color: "#fff", margin: "0 0 4px", fontSize: 15 }}>{bundle.title}</h3>
                        <div style={{ color: PINK, fontWeight: 700, fontSize: 16 }}>${bundle.price}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setEditingBundle(bundle)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, padding: "5px 9px", color: "#fff", cursor: "pointer", fontSize: 12 }}>✏️</button>
                        <button onClick={async () => {
                          if (!window.confirm("Delete bundle?")) return;
                          await fetch(`${SUPABASE_URL}/rest/v1/bundle_items?bundle_id=eq.${bundle.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY } });
                          await fetch(`${SUPABASE_URL}/rest/v1/bundles?id=eq.${bundle.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY } });
                          fetchBundles();
                        }} style={{ background: "rgba(180,0,0,0.6)", border: "none", borderRadius: 6, padding: "5px 9px", color: "#fff", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                      </div>
                    </div>
                    <p style={{ color: "#999", fontSize: 12, margin: "0 0 10px", lineHeight: 1.4 }}>{bundle.description}</p>
                    <div style={{ color: TEXT_MUTED, fontSize: 11 }}>{bundle.bundle_items?.length || 0} items</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", zIndex: 1000, padding: isMobile ? 0 : 20 }}>
            <div style={{ background: CARD_BG, borderRadius: isMobile ? "20px 20px 0 0" : 20, padding: isMobile ? "24px 20px 32px" : "32px", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
              <h3 style={{ color: "#fff", marginTop: 0, marginBottom: 18 }}>Edit Content</h3>
              {[
                { label: "Title", type: "text", key: "title" },
              ].map(({ label, type, key }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={{ color: TEXT_MUTED, fontSize: 11, display: "block", marginBottom: 4 }}>{label.toUpperCase()}</label>
                  <input type={type} defaultValue={editingItem[key] || ""} onBlur={e => updateItem(editingItem.id, { [key]: e.target.value })} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }} />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 11, display: "block", marginBottom: 4 }}>CATEGORY</label>
                <select defaultValue={editingItem.category} onChange={e => updateItem(editingItem.id, { category: e.target.value })} style={{ width: "100%", padding: "10px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
                  {["Personal","Lingerie","Bikini","Behind the Scenes","Solo Videos","Bikini Videos","Custom Videos"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 11, display: "block", marginBottom: 4 }}>PPV PRICE (USD)</label>
                <input type="number" step="0.01" defaultValue={editingItem.ppv_price || ""} onBlur={e => updateItem(editingItem.id, { ppv_price: e.target.value ? parseFloat(e.target.value) : null })} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }} />
              </div>
              <button onClick={() => setEditingItem(null)} style={{ background: "#333", border: "none", padding: "10px 20px", borderRadius: 8, color: "#fff", cursor: "pointer", width: "100%" }}>Close</button>
            </div>
          </div>
        )}

        {/* Edit Bundle Modal */}
        {editingBundle !== null && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", zIndex: 1000, padding: isMobile ? 0 : 20 }}>
            <div style={{ background: CARD_BG, borderRadius: isMobile ? "20px 20px 0 0" : 20, padding: isMobile ? "24px 20px 32px" : "32px", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto" }}>
              <h3 style={{ color: "#fff", marginTop: 0, marginBottom: 18 }}>{editingBundle.id ? "Edit Bundle" : "New Bundle"}</h3>
              {[
                { label: "Title", id: "bundleTitle", defaultValue: editingBundle.title || "", type: "text" },
                { label: "Price (USD)", id: "bundlePrice", defaultValue: editingBundle.price || "", type: "number" },
                { label: "Original Price (optional)", id: "bundleOrigPrice", defaultValue: editingBundle.original_price || "", type: "number" },
              ].map(({ label, id, defaultValue, type }) => (
                <div key={id} style={{ marginBottom: 12 }}>
                  <label style={{ color: TEXT_MUTED, fontSize: 11, display: "block", marginBottom: 4 }}>{label.toUpperCase()}</label>
                  <input type={type} defaultValue={defaultValue} id={id} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }} />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 11, display: "block", marginBottom: 4 }}>DESCRIPTION</label>
                <textarea rows="3" defaultValue={editingBundle.description || ""} id="bundleDesc" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", resize: "vertical" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 11, display: "block", marginBottom: 4 }}>EXPIRY DATE (optional)</label>
                <input type="datetime-local" defaultValue={editingBundle.expires_at ? editingBundle.expires_at.slice(0, 16) : ""} id="bundleExpiry" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setEditingBundle(null)} style={{ flex: 1, background: "#333", border: "none", padding: "12px", borderRadius: 8, color: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={async () => {
                  const title = document.getElementById("bundleTitle").value;
                  const price = parseFloat(document.getElementById("bundlePrice").value);
                  const description = document.getElementById("bundleDesc").value;
                  const original_price = document.getElementById("bundleOrigPrice").value ? parseFloat(document.getElementById("bundleOrigPrice").value) : null;
                  const expires_at = document.getElementById("bundleExpiry").value || null;
                  if (!title || isNaN(price)) { alert("Title and price are required."); return; }
                  const payload = { title, description, price, original_price, expires_at, is_active: true };
                  const method = editingBundle.id ? "PATCH" : "POST";
                  const url = editingBundle.id ? `${SUPABASE_URL}/rest/v1/bundles?id=eq.${editingBundle.id}` : `${SUPABASE_URL}/rest/v1/bundles`;
                  await fetch(url, { method, headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(payload) });
                  setEditingBundle(null);
                  fetchBundles();
                }} style={{ flex: 1, background: PINK, border: "none", padding: "12px", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}