import { createContext, useContext, useState, useEffect } from "react";

const MediaContext = createContext(null);

const STORAGE_KEY = "sofia_media_v1";
const CREATOR_KEY = "sofia_creator_logged_in";

const defaultMedia = {
  photos: [],
  videos: [],
  profile: {
    name: "Sofia Varelli",
    bio: "Welcome to my official fan site! I created this space just for you to get closer to me and see the real, unfiltered side of my life.\n\nHere you'll find exclusive photos, sexy videos, behind-the-scenes moments, and so much more that I don't share anywhere else.\n\nI love connecting with my fans and making you feel special. Thank you for being here and supporting me.",
    tagline: "I can't wait to get to know you better! xo",
    style: "Confident, classy and always real.",
    favorites: "Travel, gym, fashion and good vibes.",
    funFact: "I love spontaneous adventures.",
    avatarUrl: null,
    coverUrl: null,
  },
};

export function MediaProvider({ children }) {
  const [media, setMedia] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultMedia;
    } catch {
      return defaultMedia;
    }
  });

  const [isCreatorLoggedIn, setIsCreatorLoggedIn] = useState(() => {
    return localStorage.getItem(CREATOR_KEY) === "true";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(media));
    } catch (e) {
      console.warn("Storage quota exceeded, clearing old data");
    }
  }, [media]);

  const addPhoto = (photoObj) => {
    setMedia((prev) => ({
      ...prev,
      photos: [photoObj, ...prev.photos],
    }));
  };

  const deletePhoto = (id) => {
    setMedia((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  };

  const updatePhoto = (id, updates) => {
    setMedia((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const addVideo = (videoObj) => {
    setMedia((prev) => ({
      ...prev,
      videos: [videoObj, ...prev.videos],
    }));
  };

  const deleteVideo = (id) => {
    setMedia((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => v.id !== id),
    }));
  };

  const updateVideo = (id, updates) => {
    setMedia((prev) => ({
      ...prev,
      videos: prev.videos.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  };

  const updateProfile = (updates) => {
    setMedia((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  };

  const creatorLogin = (password) => {
    if (password === "creator123") {
      setIsCreatorLoggedIn(true);
      localStorage.setItem(CREATOR_KEY, "true");
      return true;
    }
    return false;
  };

  const creatorLogout = () => {
    setIsCreatorLoggedIn(false);
    localStorage.removeItem(CREATOR_KEY);
  };

  return (
    <MediaContext.Provider
      value={{
        media,
        isCreatorLoggedIn,
        addPhoto,
        deletePhoto,
        updatePhoto,
        addVideo,
        deleteVideo,
        updateVideo,
        updateProfile,
        creatorLogin,
        creatorLogout,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  return useContext(MediaContext);
}
