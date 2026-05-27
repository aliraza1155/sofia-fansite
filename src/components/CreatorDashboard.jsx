// src/components/CreatorDashboard.jsx
import { useState, useRef, useEffect } from "react";
import { creatorAuth } from "../lib/supabase";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// ========== STYLES ==========
const PINK = "#E8547A";
const DARK_BG = "#0D0D0D";
const CARD_BG = "#141414";
const BORDER = "#2a2a2a";
const TEXT_MUTED = "#888";
const TEXT_DIM = "#555";

// Helper: read file as data URL for preview
const readFileAsDataURL = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

// Generate thumbnail for image
const generateImageThumbnail = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) { resolve(null); return; }
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    img.onload = () => {
      let width = img.width, height = img.height;
      const maxSize = 400;
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        const thumbFile = new File([blob], `thumb_${file.name}`, { type: 'image/jpeg' });
        resolve(thumbFile);
      }, 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
};

// Generate video thumbnail (first frame)
const generateVideoThumbnail = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) { resolve(null); return; }
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => { video.currentTime = 0.5; };
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const thumbFile = new File([blob], `thumb_${file.name.split('.')[0]}.jpg`, { type: 'image/jpeg' });
        resolve(thumbFile);
      }, 'image/jpeg', 0.8);
    };
    video.onerror = () => resolve(null);
    video.src = URL.createObjectURL(file);
  });
};

// ========== LOGIN COMPONENT ==========
function CreatorLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    if (creatorAuth.login(password)) onLogin();
    else setError("Incorrect password.");
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: DARK_BG }}>
      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 24, padding: "48px 40px", width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚙️</div>
          <h2 style={{ color: "#fff", fontSize: 28 }}>Creator Access</h2>
          <p style={{ color: TEXT_MUTED, fontSize: 13 }}>Enter your password</p>
        </div>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ width: "100%", padding: "14px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 12, color: "#fff", marginBottom: 16 }} />
        {error && <div style={{ color: "#f00", marginBottom: 12 }}>{error}</div>}
        <button onClick={submit} style={{ width: "100%", background: `linear-gradient(135deg, ${PINK}, #c73460)`, border: "none", padding: "14px", borderRadius: 12, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Enter</button>
      </div>
    </div>
  );
}

// ========== MAIN DASHBOARD ==========
export default function CreatorDashboard({ onExit }) {
  const [loggedIn, setLoggedIn] = useState(creatorAuth.isLoggedIn());
  const [activeTab, setActiveTab] = useState("upload"); // upload, manage, bundles
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState("photo");
  const [uploadAccess, setUploadAccess] = useState("locked");
  const [files, setFiles] = useState([]);
  const fileRef = useRef();

  // Manage content state
  const [contentList, setContentList] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Bundles state
  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [availableContent, setAvailableContent] = useState([]); // for bundle content selection

  // Fetch all content
  const fetchContent = async () => {
    setLoadingContent(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content?order=sort_order.asc`, {
        headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
      });
      if (!res.ok) throw new Error("Failed to fetch content");
      const data = await res.json();
      setContentList(data);
      setAvailableContent(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load content");
    } finally {
      setLoadingContent(false);
    }
  };

  // Fetch bundles with their items
  const fetchBundles = async () => {
    setLoadingBundles(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/bundles?select=*,bundle_items(content_id)`, {
        headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
      });
      if (!res.ok) throw new Error("Failed to fetch bundles");
      const data = await res.json();
      setBundles(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load bundles");
    } finally {
      setLoadingBundles(false);
    }
  };

  useEffect(() => {
    if (loggedIn && activeTab === "manage") fetchContent();
    if (loggedIn && activeTab === "bundles") fetchBundles();
  }, [loggedIn, activeTab]);

  if (!loggedIn) return <CreatorLogin onLogin={() => setLoggedIn(true)} />;

  // ===== Upload helpers (unchanged) =====
  const checkDuplicate = async (fileName, fileType) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/content?title=eq.${encodeURIComponent(fileName)}&type=eq.${fileType}`, {
      headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` }
    });
    if (!res.ok) return false;
    const existing = await res.json();
    return existing.length > 0;
  };

  const handleFileSelect = async (e) => {
    const selected = Array.from(e.target.files);
    const newFiles = await Promise.all(selected.map(async (file) => ({
      file,
      preview: file.type.startsWith('image/') ? await readFileAsDataURL(file) : null,
      status: 'pending',
      progress: 0,
    })));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  const uploadAll = async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const { file } = files[i];
      const ext = file.name.split('.').pop();
      const path = `${type}s/${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`;
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading', progress: 20 } : f));
      try {
        const isDuplicate = await checkDuplicate(file.name, type);
        if (isDuplicate && !window.confirm(`"${file.name}" already exists. Overwrite?`)) {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: "Duplicate skipped" } : f));
          continue;
        }
        const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/object/content/${path}`, {
          method: "POST", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": file.type }, body: file
        });
        if (!storageRes.ok) throw new Error(`Storage error ${storageRes.status}`);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 50 } : f));

        let thumbnailPath = null;
        const thumbFile = type === 'photo' ? await generateImageThumbnail(file) : await generateVideoThumbnail(file);
        if (thumbFile) {
          const thumbPath = `${type}s/${Date.now()}_thumb_${Math.random().toString(36).substring(2, 10)}.jpg`;
          const thumbUpload = await fetch(`${SUPABASE_URL}/storage/v1/object/thumbnails/${thumbPath}`, {
            method: "POST", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": thumbFile.type }, body: thumbFile
          });
          if (thumbUpload.ok) thumbnailPath = thumbPath;
        }
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: 80 } : f));

        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/content`, {
          method: "POST", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json", "Prefer": "return=representation" },
          body: JSON.stringify({ type, storage_path: path, thumbnail_path: thumbnailPath, title: file.name, category: type === "photo" ? "Personal" : "Solo Videos", is_locked: uploadAccess === "locked", ppv_price: null, sort_order: contentList.length })
        });
        if (!insertRes.ok) throw new Error(`Insert error ${insertRes.status}`);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success', progress: 100 } : f));
        if (activeTab === "manage") fetchContent();
      } catch (err) {
        console.error(err);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: err.message } : f));
      }
    }
    setUploading(false);
    setTimeout(() => setFiles([]), 1500);
  };

  // ===== Content management actions =====
  const updateItem = async (id, updates) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.${id}`, {
        method: "PATCH", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Update failed");
      setContentList(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      setEditingItem(null);
    } catch (err) { alert(err.message); }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This will also remove the file from storage.`)) return;
    try {
      if (item.storage_path) await fetch(`${SUPABASE_URL}/storage/v1/object/content/${item.storage_path}`, { method: "DELETE", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
      if (item.thumbnail_path) await fetch(`${SUPABASE_URL}/storage/v1/object/thumbnails/${item.thumbnail_path}`, { method: "DELETE", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
      const res = await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.${item.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY } });
      if (!res.ok) throw new Error("Delete failed");
      setContentList(prev => prev.filter(i => i.id !== item.id));
    } catch (err) { alert(err.message); }
  };

  const moveItem = async (id, direction) => {
    const index = contentList.findIndex(i => i.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === contentList.length - 1)) return;
    const newList = [...contentList];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
    for (let i = 0; i < newList.length; i++) {
      await updateItem(newList[i].id, { sort_order: i });
    }
    setContentList(newList);
  };

  const replaceFile = async (item, newFile) => {
    if (!window.confirm(`Replace "${item.title}"? The old file will be deleted.`)) return;
    const ext = newFile.name.split('.').pop();
    const newPath = `${item.type}s/${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`;
    try {
      const storageRes = await fetch(`${SUPABASE_URL}/storage/v1/object/content/${newPath}`, {
        method: "POST", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": newFile.type }, body: newFile
      });
      if (!storageRes.ok) throw new Error("Storage upload failed");
      await fetch(`${SUPABASE_URL}/storage/v1/object/content/${item.storage_path}`, { method: "DELETE", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } });
      await updateItem(item.id, { storage_path: newPath });
      alert("File replaced successfully");
      fetchContent();
    } catch (err) { alert(err.message); }
  };

  // ===== Bundle actions =====
  const saveBundle = async (bundleData, bundleId = null) => {
    try {
      let response;
      if (bundleId) {
        response = await fetch(`${SUPABASE_URL}/rest/v1/bundles?id=eq.${bundleId}`, {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(bundleData)
        });
      } else {
        response = await fetch(`${SUPABASE_URL}/rest/v1/bundles`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json", "Prefer": "return=representation" },
          body: JSON.stringify(bundleData)
        });
      }
      if (!response.ok) throw new Error("Failed to save bundle");
      await fetchBundles();
      setEditingBundle(null);
    } catch (err) { alert(err.message); }
  };

  const deleteBundle = async (bundleId) => {
    if (!window.confirm("Delete this bundle? This will also remove all items in it.")) return;
    try {
      // Delete bundle items first (cascade should handle, but manual safe)
      await fetch(`${SUPABASE_URL}/rest/v1/bundle_items?bundle_id=eq.${bundleId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY } });
      await fetch(`${SUPABASE_URL}/rest/v1/bundles?id=eq.${bundleId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY } });
      await fetchBundles();
    } catch (err) { alert(err.message); }
  };

  const addBundleItem = async (bundleId, contentId) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/bundle_items`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ bundle_id: bundleId, content_id: contentId })
      });
      if (!res.ok) throw new Error("Failed to add item");
      await fetchBundles();
    } catch (err) { alert(err.message); }
  };

  const removeBundleItem = async (bundleId, contentId) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/bundle_items?bundle_id=eq.${bundleId}&content_id=eq.${contentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "apikey": SUPABASE_SERVICE_ROLE_KEY }
      });
      await fetchBundles();
    } catch (err) { alert(err.message); }
  };

  // ===== Rendering =====
  return (
    <div style={{ background: DARK_BG, minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>⚙️ Creator Studio</h1>
          <button onClick={() => { creatorAuth.logout(); onExit(); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, padding: "8px 20px", borderRadius: 40, color: "#fff", cursor: "pointer" }}>Log Out</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 24, marginBottom: 32, borderBottom: `1px solid ${BORDER}`, paddingBottom: 12 }}>
          <button onClick={() => setActiveTab("upload")} style={{ background: "none", border: "none", fontSize: 16, fontWeight: activeTab === "upload" ? 700 : 400, color: activeTab === "upload" ? PINK : TEXT_MUTED, cursor: "pointer", padding: "8px 0" }}>📤 Upload New</button>
          <button onClick={() => { setActiveTab("manage"); fetchContent(); }} style={{ background: "none", border: "none", fontSize: 16, fontWeight: activeTab === "manage" ? 700 : 400, color: activeTab === "manage" ? PINK : TEXT_MUTED, cursor: "pointer", padding: "8px 0" }}>📋 Manage Content</button>
          <button onClick={() => { setActiveTab("bundles"); fetchBundles(); }} style={{ background: "none", border: "none", fontSize: 16, fontWeight: activeTab === "bundles" ? 700 : 400, color: activeTab === "bundles" ? PINK : TEXT_MUTED, cursor: "pointer", padding: "8px 0" }}>🎁 Bundles</button>
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Left panel – upload settings */}
            <div style={{ background: CARD_BG, borderRadius: 24, border: `1px solid ${BORDER}`, padding: "24px" }}>
              <h2 style={{ color: "#fff", fontSize: 20, marginTop: 0, marginBottom: 20 }}>Upload Settings</h2>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, letterSpacing: 1, display: "block", marginBottom: 8 }}>MEDIA TYPE</label>
                <div style={{ display: "flex", gap: 12, background: "#1a1a1a", borderRadius: 16, padding: 4 }}>
                  <button onClick={() => setType("photo")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: type === "photo" ? PINK : "transparent", color: type === "photo" ? "#fff" : TEXT_MUTED, fontWeight: 600, cursor: "pointer" }}>📷 Photos</button>
                  <button onClick={() => setType("video")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: type === "video" ? PINK : "transparent", color: type === "video" ? "#fff" : TEXT_MUTED, fontWeight: 600, cursor: "pointer" }}>🎬 Videos</button>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, letterSpacing: 1, display: "block", marginBottom: 8 }}>ACCESS LEVEL</label>
                <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 4, display: "flex", gap: 12 }}>
                  <button onClick={() => setUploadAccess("locked")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: uploadAccess === "locked" ? PINK : "transparent", color: uploadAccess === "locked" ? "#fff" : TEXT_MUTED, fontWeight: 600, cursor: "pointer" }}>🔒 Members Only</button>
                  <button onClick={() => setUploadAccess("free")} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: uploadAccess === "free" ? PINK : "transparent", color: uploadAccess === "free" ? "#fff" : TEXT_MUTED, fontWeight: 600, cursor: "pointer" }}>🔓 Free Preview</button>
                </div>
                <p style={{ color: TEXT_DIM, fontSize: 12, marginTop: 8 }}>{uploadAccess === "locked" ? "Only active subscribers can view" : "Everyone can view (no login required)"}</p>
              </div>
              <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${BORDER}`, borderRadius: 20, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.02)", marginBottom: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{type === "photo" ? "🖼️" : "🎥"}</div>
                <div style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>Click or drag files here</div>
                <div style={{ color: TEXT_MUTED, fontSize: 13 }}>{type === "photo" ? "JPG, PNG, WEBP up to 20MB" : "MP4, MOV up to 500MB"}</div>
                <input ref={fileRef} type="file" accept={type === "photo" ? "image/*" : "video/*"} multiple style={{ display: "none" }} onChange={handleFileSelect} />
              </div>
              {files.length > 0 && <button onClick={uploadAll} disabled={uploading} style={{ width: "100%", background: uploading ? "#333" : `linear-gradient(135deg, ${PINK}, #c73460)`, border: "none", padding: "14px", borderRadius: 16, color: "#fff", fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer" }}>{uploading ? "Uploading..." : `🚀 Upload ${files.length} file(s)`}</button>}
            </div>
            {/* Right panel – file queue */}
            <div style={{ background: CARD_BG, borderRadius: 24, border: `1px solid ${BORDER}`, padding: "24px", overflow: "auto" }}>
              <h2 style={{ color: "#fff", fontSize: 18, marginBottom: 16 }}>Upload Queue</h2>
              {files.length === 0 ? <div style={{ textAlign: "center", padding: "60px 20px", color: TEXT_DIM }}><div style={{ fontSize: 40, marginBottom: 8 }}>📂</div><div>No files selected</div></div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {files.map((item, idx) => (
                    <div key={idx} style={{ background: "#1a1a1a", borderRadius: 16, padding: "12px", display: "flex", gap: 12, alignItems: "center", border: `1px solid ${BORDER}` }}>
                      <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: "#111", flexShrink: 0 }}>
                        {item.preview ? <img src={item.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{type === "photo" ? "🖼️" : "🎬"}</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{item.file.name}</div>
                        <div style={{ height: 4, background: "#2a2a2a", borderRadius: 2, marginTop: 4 }}><div style={{ width: `${item.progress}%`, height: 4, borderRadius: 2, background: item.status === 'error' ? "#f00" : PINK }} /></div>
                        <div style={{ fontSize: 10, color: item.status === 'error' ? "#f66" : TEXT_MUTED, marginTop: 4 }}>
                          {item.status === 'pending' && "Waiting..."}
                          {item.status === 'uploading' && "Uploading..."}
                          {item.status === 'success' && "✓ Done"}
                          {item.status === 'error' && `Error: ${item.error}`}
                        </div>
                      </div>
                      <button onClick={() => removeFile(idx)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Content Tab */}
        {activeTab === "manage" && (
          <div style={{ background: CARD_BG, borderRadius: 24, border: `1px solid ${BORDER}`, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#fff", fontSize: 20, margin: 0 }}>All Content</h2>
              <button onClick={fetchContent} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px", color: "#fff", cursor: "pointer" }}>🔄 Refresh</button>
            </div>
            {loadingContent ? <div style={{ textAlign: "center", padding: 60, color: TEXT_MUTED }}>Loading...</div> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {contentList.map(item => (
                  <div key={item.id} style={{ background: "#1a1a1a", borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}` }}>
                    <div style={{ aspectRatio: "3/4", background: "#111", position: "relative" }}>
                      {item.thumbnail_path ? (
                        <img src={`${SUPABASE_URL}/storage/v1/object/public/thumbnails/${item.thumbnail_path}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{item.type === "photo" ? "🖼️" : "🎬"}</div>
                      )}
                      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                        <button onClick={() => setEditingItem(item)} style={{ background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", cursor: "pointer" }}>✏️</button>
                        <button onClick={() => deleteItem(item)} style={{ background: "rgba(200,0,0,0.7)", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", cursor: "pointer" }}>🗑️</button>
                      </div>
                      <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 6px", fontSize: 10, color: "#fff" }}>
                        {item.is_locked ? "🔒 Locked" : "🔓 Free"}
                      </div>
                      <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 4 }}>
                        <button onClick={() => moveItem(item.id, 'up')} style={{ background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 4, padding: "2px 6px", color: "#fff", cursor: "pointer" }}>▲</button>
                        <button onClick={() => moveItem(item.id, 'down')} style={{ background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 4, padding: "2px 6px", color: "#fff", cursor: "pointer" }}>▼</button>
                      </div>
                    </div>
                    <div style={{ padding: "10px" }}>
                      <div style={{ color: "#fff", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                      <div style={{ color: TEXT_MUTED, fontSize: 10, marginTop: 4 }}>{item.category || "Uncategorized"}</div>
                      <label style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={!item.is_locked} onChange={e => updateItem(item.id, { is_locked: !e.target.checked })} />
                        <span style={{ color: TEXT_MUTED, fontSize: 10 }}>Free preview</span>
                      </label>
                      <input type="file" accept={item.type === "photo" ? "image/*" : "video/*"} style={{ marginTop: 8, fontSize: 10 }} onChange={async (e) => { if (e.target.files[0]) await replaceFile(item, e.target.files[0]); }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bundles Tab */}
        {activeTab === "bundles" && (
          <div style={{ background: CARD_BG, borderRadius: 24, border: `1px solid ${BORDER}`, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#fff", fontSize: 20, margin: 0 }}>Bundles</h2>
              <button onClick={() => setEditingBundle({})} style={{ background: PINK, border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", cursor: "pointer" }}>+ New Bundle</button>
            </div>
            {loadingBundles ? <div style={{ textAlign: "center", padding: 60, color: TEXT_MUTED }}>Loading...</div> : bundles.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: TEXT_MUTED }}>No bundles yet. Create one!</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {bundles.map(bundle => (
                  <div key={bundle.id} style={{ background: "#1a1a1a", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div>
                          <h3 style={{ color: "#fff", margin: "0 0 4px 0" }}>{bundle.title}</h3>
                          <div style={{ color: PINK, fontWeight: 700 }}>${bundle.price}</div>
                          {bundle.original_price && <div style={{ color: TEXT_MUTED, fontSize: 12, textDecoration: "line-through" }}>${bundle.original_price}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setEditingBundle(bundle)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", cursor: "pointer" }}>✏️</button>
                          <button onClick={() => deleteBundle(bundle.id)} style={{ background: "rgba(200,0,0,0.6)", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", cursor: "pointer" }}>🗑️</button>
                        </div>
                      </div>
                      <p style={{ color: "#aaa", fontSize: 13, marginTop: 8 }}>{bundle.description}</p>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ color: TEXT_MUTED, fontSize: 12, marginBottom: 8 }}>Included content:</div>
                        <div style={{ maxHeight: 150, overflowY: "auto", background: "#111", borderRadius: 8, padding: "8px" }}>
                          {bundle.bundle_items && bundle.bundle_items.length ? (
                            bundle.bundle_items.map((bi, idx) => {
                              const contentItem = contentList.find(c => c.id === bi.content_id);
                              return (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${BORDER}` }}>
                                  <span style={{ fontSize: 13, color: "#fff" }}>{contentItem?.title || bi.content_id}</span>
                                  <button onClick={() => removeBundleItem(bundle.id, bi.content_id)} style={{ background: "none", border: "none", color: "#f66", cursor: "pointer", fontSize: 12 }}>Remove</button>
                                </div>
                              );
                            })
                          ) : <div style={{ color: TEXT_MUTED, fontSize: 12 }}>No items added yet.</div>}
                        </div>
                        <button onClick={async () => {
                          // Simple prompt to add content by ID (could be enhanced with a dropdown)
                          const cid = prompt("Enter content ID to add (from Manage Content tab)");
                          if (cid) await addBundleItem(bundle.id, cid);
                        }} style={{ marginTop: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", color: "#fff", cursor: "pointer", width: "100%" }}>+ Add Content</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Modals */}
        {editingItem && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: CARD_BG, borderRadius: 24, padding: "32px", width: "90%", maxWidth: 500 }}>
              <h3 style={{ color: "#fff", marginBottom: 20 }}>Edit Content</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, display: "block", marginBottom: 4 }}>Title</label>
                <input type="text" defaultValue={editingItem.title} onBlur={e => updateItem(editingItem.id, { title: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, display: "block", marginBottom: 4 }}>Category</label>
                <select defaultValue={editingItem.category} onChange={e => updateItem(editingItem.id, { category: e.target.value })} style={{ width: "100%", padding: "8px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }}>
                  <option value="Personal">Personal</option>
                  <option value="Lingerie">Lingerie</option>
                  <option value="Bikini">Bikini</option>
                  <option value="Behind the Scenes">Behind the Scenes</option>
                  <option value="Solo Videos">Solo Videos</option>
                  <option value="Bikini Videos">Bikini Videos</option>
                  <option value="Custom Videos">Custom Videos</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, display: "block", marginBottom: 4 }}>PPV Price (USD)</label>
                <input type="number" step="0.01" defaultValue={editingItem.ppv_price || ""} onBlur={e => updateItem(editingItem.id, { ppv_price: e.target.value ? parseFloat(e.target.value) : null })} style={{ width: "100%", padding: "8px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
              </div>
              <button onClick={() => setEditingItem(null)} style={{ background: "#333", border: "none", padding: "8px 16px", borderRadius: 8, color: "#fff", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        )}

        {editingBundle !== null && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: CARD_BG, borderRadius: 24, padding: "32px", width: "90%", maxWidth: 500 }}>
              <h3 style={{ color: "#fff", marginBottom: 20 }}>{editingBundle.id ? "Edit Bundle" : "New Bundle"}</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, display: "block", marginBottom: 4 }}>Title</label>
                <input type="text" defaultValue={editingBundle.title || ""} id="bundleTitle" style={{ width: "100%", padding: "8px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, display: "block", marginBottom: 4 }}>Description</label>
                <textarea rows="3" defaultValue={editingBundle.description || ""} id="bundleDesc" style={{ width: "100%", padding: "8px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, display: "block", marginBottom: 4 }}>Price (USD)</label>
                <input type="number" step="0.01" defaultValue={editingBundle.price || ""} id="bundlePrice" style={{ width: "100%", padding: "8px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, display: "block", marginBottom: 4 }}>Original Price (optional)</label>
                <input type="number" step="0.01" defaultValue={editingBundle.original_price || ""} id="bundleOrigPrice" style={{ width: "100%", padding: "8px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT_MUTED, fontSize: 12, display: "block", marginBottom: 4 }}>Expiry Date (optional)</label>
                <input type="datetime-local" defaultValue={editingBundle.expires_at ? editingBundle.expires_at.slice(0, 16) : ""} id="bundleExpiry" style={{ width: "100%", padding: "8px 12px", background: "#1a1a1a", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" }} />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                <button onClick={() => setEditingBundle(null)} style={{ background: "#333", border: "none", padding: "8px 16px", borderRadius: 8, color: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => {
                  const title = document.getElementById("bundleTitle").value;
                  const description = document.getElementById("bundleDesc").value;
                  const price = parseFloat(document.getElementById("bundlePrice").value);
                  const original_price = document.getElementById("bundleOrigPrice").value ? parseFloat(document.getElementById("bundleOrigPrice").value) : null;
                  const expires_at = document.getElementById("bundleExpiry").value || null;
                  if (!title || isNaN(price)) { alert("Title and price are required."); return; }
                  saveBundle({ title, description, price, original_price, expires_at, is_active: true }, editingBundle.id);
                }} style={{ background: PINK, border: "none", padding: "8px 16px", borderRadius: 8, color: "#fff", cursor: "pointer" }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}