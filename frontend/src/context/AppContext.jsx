import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // AUTH STATES
  const [userToken, setUserToken] = useState(localStorage.getItem("userToken") || "");
  const [employerToken, setEmployerToken] = useState(localStorage.getItem("employerToken") || "");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  // DOCUMENT REFRESH TRIGGER
  const [refreshDocs, setRefreshDocs] = useState(false);
  // USER PROFILE
  const [userProfile, setUserProfile] = useState(null);

  // AXIOS INSTANCE
  const api = axios.create({
    baseURL: backendUrl,
    headers: { "Content-Type": "application/json" },
  });

  // LOAD USER PROFILE
  const loadUserProfile = async () => {
    if (!userToken) return;
    try {
      const { data } = await api.get("/api/user/profile", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (data.success) {
        const user = data.user || {};
        // Normalize dob to YYYY-MM-DD so <input type="date"> shows the value correctly
        if (user.dob) {
          // dob may come as ISO string (2023-01-01T00:00:00.000Z) or Date
          try {
            const s = typeof user.dob === "string" ? user.dob : new Date(user.dob).toISOString();
            user.dob = s.split("T")[0];
          } catch (e) {
            // fallback: leave as-is
          }
        }

        setUserProfile(user);
      }
    } catch (err) {
      console.log("Profile load failed:", err.message);
    }
  };

  // AUTO LOAD USER PROFILE ON TOKEN CHANGE
  useEffect(() => {
    loadUserProfile();
  }, [userToken]);

  return (
    <AppContext.Provider
  value={{
    backendUrl,
    api,

    userToken,
    setUserToken,

    userName,
    setUserName,

    employerToken,
    setEmployerToken,

    refreshDocs,
    setRefreshDocs,

    userProfile,
    setUserProfile,
    loadUserProfile
  }}
>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;