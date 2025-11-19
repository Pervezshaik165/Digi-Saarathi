import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
    toast.success(`${mode} successful!`);

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

        <p className="text-2xl font-semibold text-center">{mode}</p>

        {/* USER SIGNUP */}
        {mode === "User Sign Up" && (
          <div className="w-full mt-2">
            <p className="text-sm">Full Name</p>
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
            <p className="text-sm">Company Name</p>
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
          <p className="text-sm">Email</p>
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
          <p className="text-sm">Password</p>
          <input
            className="w-full p-2 border rounded mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="w-full mt-4 bg-primary text-white py-2 rounded hover:bg-blue-700 transition">
          {mode.includes("Sign Up") ? "Create Account" : "Login"}
        </button>

        {/* SWITCH */}
        <div className="text-center text-sm mt-3">
          {mode === "User Login" && (
            <>
              <p>
                New user?{" "}
                <span className="text-primary underline cursor-pointer"
                  onClick={() => setMode("User Sign Up")}>
                  Sign Up
                </span>
              </p>
              <p>
                Employer?{" "}
                <span className="text-primary underline cursor-pointer"
                  onClick={() => setMode("Employer Login")}>
                  Login here
                </span>
              </p>
            </>
          )}

          {mode === "Employer Login" && (
            <>
              <p>
                Need employer account?{" "}
                <span className="text-primary underline cursor-pointer"
                  onClick={() => setMode("Employer Sign Up")}>
                  Sign Up
                </span>
              </p>
              <p>
                User?{" "}
                <span className="text-primary underline cursor-pointer"
                  onClick={() => setMode("User Login")}>
                  Login here
                </span>
              </p>
            </>
          )}

          {mode === "User Sign Up" && (
            <p>
              Already have an account?{" "}
              <span className="text-primary underline cursor-pointer"
                onClick={() => setMode("User Login")}>
                Login
              </span>
            </p>
          )}

          {mode === "Employer Sign Up" && (
            <p>
              Already registered?{" "}
              <span className="text-primary underline cursor-pointer"
                onClick={() => setMode("Employer Login")}>
                Login
              </span>
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default Login;
