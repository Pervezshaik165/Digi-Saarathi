import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";

import logo from "../assets/logo.png";
import defaultProfile from "../assets/default_profile.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { userToken, setUserToken, userProfile } = useContext(AppContext);
  const { t, i18n } = useTranslation();

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "bn", label: "বাংলা" },
    { code: "ta", label: "தமிழ்" },
    { code: "te", label: "తెలుగు" },
    { code: "mr", label: "मराठी" },
    { code: "gu", label: "ગુજરાતી" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "ml", label: "മലയാളം" },
  ];

  const logout = () => {
    localStorage.removeItem("userToken");
    setUserToken("");
    navigate("/");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD] px-4">

      {/* ---------- LOGO ---------- */}
      <div
        onClick={() => navigate("/user/dashboard")}
        className="cursor-pointer font-extrabold text-3xl md:text-4xl tracking-wide flex items-center gap-1 select-none mr-70"
      >
        <span className="text-[#FF9933]">Digi</span>
        <span className="text-[#000080]">Saa</span>
        <span className="text-[#138808]">rathi</span>
      </div>

      {/* ---------- DESKTOP NAV MENU ---------- */}
      <ul className="md:flex items-center gap-8 font-medium hidden flex-1 justify-center">
        <NavLink to="/user/dashboard">
          <li className="py-1 hover:text-primary">{t("nav.dashboard")}</li>
        </NavLink>

        <NavLink to="/user/jobs">
          <li className="py-1 hover:text-primary">{t("nav.jobs")}</li>
        </NavLink>

        <NavLink to="/user/schemes">
          <li className="py-1 hover:text-primary">{t("nav.schemes")}</li>
        </NavLink>

        <NavLink to="/user/documents">
          <li className="py-1 hover:text-primary">{t("nav.documents")}</li>
        </NavLink>

        <NavLink to="/user/profile">
          <li className="py-1 hover:text-primary">{t("nav.myProfile")}</li>
        </NavLink>
      </ul>

      {/* ---------- RIGHT SIDE ---------- */}
      <div className="flex items-center gap-4">

        {/* Language selector (always visible) */}
        <select
          value={i18n.language || "en"}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="border rounded px-2 py-1 text-sm mr-3"
          aria-label={t("nav.language")}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        {userToken ? (
          <div className="relative flex items-center gap-2">

            {/* Profile Button */}
            <div
              className="flex items-center gap-2 cursor-pointer mr-6"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={userProfile?.image || defaultProfile}
                className="w-8 h-8 rounded-full border object-cover"
                alt="profile"
              />
              <FiChevronDown className="text-gray-700 w-5 h-5" />
            </div>

            {/* CLICK-BASED DROPDOWN */}
            {showDropdown && (
              <div className="absolute right-0 top-14 bg-white shadow-xl rounded-lg p-4 w-52 text-gray-800 z-50">
                
                <p
                  className="cursor-pointer py-1 hover:text-primary"
                  onClick={() => {
                    navigate("/user/profile");
                    setShowDropdown(false);
                  }}
                >
                  {t("nav.myProfile")}
                </p>

                <p
                  className="cursor-pointer py-1 hover:text-primary"
                  onClick={() => {
                    navigate("/user/qr");
                    setShowDropdown(false);
                  }}
                >
                  {t("nav.myQR")}
                </p>

                <p
                  className="cursor-pointer py-1 hover:text-primary"
                  onClick={() => {
                    navigate("/user/documents");
                    setShowDropdown(false);
                  }}
                >
                  {t("nav.myDocuments")}
                </p>

                <p
                  className="cursor-pointer py-1 hover:text-red-600"
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                >
                  {t("nav.logout")}
                </p>

              </div>
            )}

          </div>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-8 py-2 rounded-full hidden md:block"
          >
            {t("nav.login")}
          </button>
        )}

        {/* ---------- MOBILE MENU ICON ---------- */}
        <FiMenu
          className="text-3xl md:hidden cursor-pointer"
          onClick={() => setShowMenu(true)}
        />
      </div>

      {/* ---------- MOBILE SLIDE MENU ---------- */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 p-5 transition-all
          ${showMenu ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <img src={logo} className="h-10 object-contain" alt="logo" />
          <FiX
            className="text-3xl cursor-pointer"
            onClick={() => setShowMenu(false)}
          />
        </div>

        <ul className="flex flex-col gap-6 text-lg font-medium">
          <NavLink to="/user/dashboard" onClick={() => setShowMenu(false)}>
            {t("nav.dashboard")}
          </NavLink>
          <NavLink to="/user/jobs" onClick={() => setShowMenu(false)}>
            {t("nav.jobs")}
          </NavLink>
          <NavLink to="/user/schemes" onClick={() => setShowMenu(false)}>
            {t("nav.schemes")}
          </NavLink>
          <NavLink to="/user/documents" onClick={() => setShowMenu(false)}>
            {t("nav.documents")}
          </NavLink>
          <NavLink to="/user/profile" onClick={() => setShowMenu(false)}>
            {t("nav.myProfile")}
          </NavLink>
          <NavLink to="/user/qr" onClick={() => setShowMenu(false)}>
            {t("nav.myQR")}
          </NavLink>

          {userToken && (
            <p
              className="text-red-600 cursor-pointer"
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
            >
              {t('nav.logout')}
            </p>
          )}
        </ul>
      </div>

    </div>
  );
};

export default Navbar;
