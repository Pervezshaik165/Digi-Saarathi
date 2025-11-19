import { createContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const backendUrl = "http://localhost:5000";

  const [adminToken, setAdminTokenState] = useState(
    localStorage.getItem("adminToken") || ""
  );

  // Create a stable axios instance so headers/interceptors persist across renders
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: backendUrl,
      headers: { "Content-Type": "application/json" },
    });

    // Show backend messages (success/error) as toast notifications
    instance.interceptors.response.use(
      (response) => {
        const msg = response?.data?.message;
        const ok = response?.data?.success;
        if (msg) {
          if (ok) toast.success(msg);
          else toast.error(msg);
        }
        return response;
      },
      (error) => {
        const errMsg = error?.response?.data?.message || error.message || "Request failed";
        toast.error(errMsg);
        return Promise.reject(error);
      }
    );

    return instance;
  }, [backendUrl]);

  // Ensure axios always has the latest token in its defaults whenever adminToken changes
  useEffect(() => {
    if (adminToken) api.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
    else delete api.defaults.headers.common["Authorization"];
  }, [adminToken, api]);

  // Provide a setter that updates axios defaults immediately and persists token
  const setAdminToken = (token) => {
    setAdminTokenState(token);
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("adminToken", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("adminToken");
    }
  };

  return (
    <AdminContext.Provider
      value={{ backendUrl, api, adminToken, setAdminToken }}
    >
      {children}
    </AdminContext.Provider>
  );
};
