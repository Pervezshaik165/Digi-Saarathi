import React, { createContext, useState } from "react";
import axios from "axios";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const backendUrl = "http://localhost:5000";

const [userToken, setUserToken] = useState(localStorage.getItem("userToken") || "");
const [employerToken, setEmployerToken] = useState(localStorage.getItem("employerToken") || "");
const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

  const api = axios.create({
    baseURL: backendUrl,
    headers: { "Content-Type": "application/json" }
  });

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        api,

        // USER AUTH
        userToken,
        setUserToken,
        userName,
        setUserName,

        // EMPLOYER AUTH
        employerToken,
        setEmployerToken,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export default AppProvider;