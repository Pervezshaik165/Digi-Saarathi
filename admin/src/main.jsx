import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AdminProvider } from "./context/AdminContext.jsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AdminProvider>
      <App />
      <ToastContainer position="top-right" />
    </AdminProvider>
  </BrowserRouter>
);
