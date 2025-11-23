import React from "react";
import { useNavigate } from "react-router-dom";

const EmployerHeader = ({ title, showBack, backTo, right }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className=" flex justify-between items-center">
          <div className="pl-0 flex items-center gap-4">
            <div
              onClick={() => navigate("/employer/dashboard")}
              className="cursor-pointer font-extrabold  text-3xl md:text-4xl tracking-wide flex items-center gap-1 select-none"
            >
              <span className="text-[#FF9933]">Digi</span>
              <span className="text-[#000080]">Saa</span>
              <span className="text-[#138808]">rathi</span>
            </div>
            {title && <h1 className="text-2xl font-bold text-gray-900 ml-4">{title}</h1>}
          </div>

          <div className="flex items-center gap-4">
            {right}
            {showBack && (
              <button
                onClick={() => navigate(backTo || "/employer/dashboard")}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                ← Back
              </button>
            )}

            <nav className="flex gap-4">
              <button
                onClick={() => navigate("/employer/jobs")}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Jobs
              </button>
              <button
                onClick={() => navigate("/employer/documents")}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Documents
              </button>
              <button
                onClick={() => navigate("/employer/profile")}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("employerToken");
                  window.location.href = "/";
                }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployerHeader;
