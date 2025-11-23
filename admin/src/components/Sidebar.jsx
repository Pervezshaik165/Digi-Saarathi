import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ onLogout }) => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg mb-3 text-sm font-medium ${isActive ? "bg-slate-800 text-white shadow" : "text-slate-700 hover:bg-slate-100"}`;

  return (
    <aside className="w-64 bg-slate-50 border-r min-h-screen sticky top-0">
      <div className="p-6">
        <div className="text-2xl font-extrabold tracking-tight">
          <span className="text-orange-400">Digi</span>
          <span className="text-blue-800">Saa</span>
          <span className="text-green-600">rathi</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Admin Portal</div>
      </div>

      <nav className="px-4">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/employers" className={linkClass}>
          Employers Details
        </NavLink>
        <NavLink to="/workers" className={linkClass}>
          Workers Details
        </NavLink>
        <NavLink to="/documents" className={linkClass}>
          Worker's Documents 
        </NavLink>
        <NavLink to="/employer-documents" className={linkClass}>
          Employer's Documents
        </NavLink>
        <NavLink to="/jobs" className={linkClass}>
          Jobs
        </NavLink>
        <NavLink to="/verifications" className={linkClass}>
          Logs
        </NavLink>

        <div className="mt-8">
          <button
            onClick={onLogout}
            className="w-full text-red-600 text-left px-4 py-2 rounded hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </nav>

      
    </aside>
  );
};

export default Sidebar;
