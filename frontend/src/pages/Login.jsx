import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [mode, setMode] = useState("User Login");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    api,
    userToken,
    employerToken,
    setUserToken,
    setEmployerToken,
    setUserName
  } = useContext(AppContext);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const modeKey = (m) => {
    if (m === "User Login") return "login.user_login.label";
    if (m === "User Sign Up") return "login.user_signup.label";
    if (m === "Employer Login") return "login.employer_login.label";
    if (m === "Employer Sign Up") return "login.employer_signup.label";
    return "login.user_login.label";
  };

const onSubmitHandler = async (event) => {
  event.preventDefault();

  const clearInputs = () => {
    setEmail("");
    setPassword("");
    setName("");
    setCompany("");
  };

  try {
    let endpoint = "";
    let payload = {};

    // Decide endpoints based on mode
    if (mode === "User Sign Up") {
      endpoint = "/api/user/register";
      payload = { name, email, password };
    } 
    else if (mode === "User Login") {
      endpoint = "/api/user/login";
      payload = { email, password };
    }
    else if (mode === "Employer Sign Up") {
      endpoint = "/api/employer/register";
      payload = { company, email, password };
    }
    else if (mode === "Employer Login") {
      endpoint = "/api/employer/login";
      payload = { email, password };
    }

    const response = await api.post(endpoint, payload);
    const { data } = response;

    // ❌ If backend returns success:false → show toast
    if (!data.success) {
      toast.error(data.message || "Login failed");
      clearInputs();
      return;
    }

    // SUCCESS
    toast.success(t("login.success", { mode: t(modeKey(mode)) }));

    if (mode.includes("User")) {
      setUserToken(data.token);
      localStorage.setItem("userToken", data.token);
      if (data.user && data.user.name) {
        setUserName(data.user.name);
        localStorage.setItem("userName", data.user.name);
      }
    } else {
      setEmployerToken(data.token);
      localStorage.setItem("employerToken", data.token);
    }

    clearInputs();

  } catch (error) {
    // This runs **only for network/server errors**
    toast.error(error.response?.data?.message || "Something went wrong");
    clearInputs();
  }
};


  // REDIRECT BASED ON TOKEN
  useEffect(() => {
    // We handle user navigation explicitly after fetching profile (to allow username in URL).
    if (userToken) navigate("/user/dashboard");
    if (employerToken) navigate("/employer/dashboard");
  }, [userToken, employerToken]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-screen flex items-center justify-center bg-gray-100"
    >
      <div className="p-8 max-w-sm w-full bg-white border rounded-xl shadow">

        <p className="text-2xl font-semibold text-center">{t(modeKey(mode))}</p>

        {/* USER SIGNUP */}
        {mode === "User Sign Up" && (
          <div className="w-full mt-2">
            <p className="text-sm">{t("login.fullName")}</p>
            <input
              className="w-full p-2 border rounded mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        {/* EMPLOYER SIGNUP */}
        {mode === "Employer Sign Up" && (
          <div className="w-full mt-2">
            <p className="text-sm">{t("login.companyName")}</p>
            <input
              className="w-full p-2 border rounded mt-1"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>
        )}

        {/* EMAIL */}
        <div className="w-full mt-2">
          <p className="text-sm">{t("login.email")}</p>
          <input
            className="w-full p-2 border rounded mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="w-full mt-2">
          <p className="text-sm">{t("login.password")}</p>
          <input
            className="w-full p-2 border rounded mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="w-full mt-4 bg-primary text-white py-2 rounded hover:bg-blue-700 transition">
          {mode.includes("Sign Up") ? t("login.createAccount") : t("login.loginButton")}
        </button>

        {/* SWITCH */}
        <div className="text-center text-sm mt-3">
          {mode === "User Login" && (
            <>
              <p>
                {t("login.newUser")} {" "}
                <span className="text-primary underline cursor-pointer"
                  onClick={() => setMode("User Sign Up")}>
                  {t("login.signUp")}
                </span>
              </p>
              <p>
                {t("login.employerQuestion")} {" "}
                <span className="text-primary underline cursor-pointer"
                  onClick={() => setMode("Employer Login")}>
                  {t("login.loginHere")}
                </span>
              </p>
            </>
          )}

          {mode === "Employer Login" && (
            <>
              <p>
                {t("login.needEmployer")} {" "}
                <span className="text-primary underline cursor-pointer"
                  onClick={() => setMode("Employer Sign Up")}>
                  {t("login.signUp")}
                </span>
              </p>
              <p>
                {t("login.user_login.label")} {" "}
                <span className="text-primary underline cursor-pointer"
                  onClick={() => setMode("User Login")}>
                  {t("login.loginHere")}
                </span>
              </p>
            </>
          )}

          {mode === "User Sign Up" && (
            <p>
              {t("login.alreadyHaveAccount")} {" "}
              <span className="text-primary underline cursor-pointer"
                onClick={() => setMode("User Login")}>
                {t("login.loginButton")}
              </span>
            </p>
          )}

          {mode === "Employer Sign Up" && (
            <p>
              {t("login.alreadyHaveAccount")} {" "}
              <span className="text-primary underline cursor-pointer"
                onClick={() => setMode("Employer Login")}>
                {t("login.loginButton")}
              </span>
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default Login;
