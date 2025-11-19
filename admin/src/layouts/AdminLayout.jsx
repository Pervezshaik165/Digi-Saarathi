import React, { useContext, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { AdminContext } from "../context/AdminContext";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-toastify";

const AdminLayout = () => {
  const { setAdminToken } = useContext(AdminContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logout = () => {
    // open confirmation modal
    setShowLogoutModal(true);
  };

  const performLogout = () => {
    toast.info("Logging out");
    setAdminToken("");
    localStorage.removeItem("adminToken");
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => setShowLogoutModal(false);

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar onLogout={logout} />

      <ConfirmModal
        open={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout from the admin portal?"
        onConfirm={performLogout}
        onCancel={cancelLogout}
      />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
