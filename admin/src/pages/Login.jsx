import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const { api, setAdminToken } = useContext(AdminContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/api/admin/login", { email, password });

      if (!data.success) {
        // response interceptor already shows backend message as toast, so just return
        return;
      }

      setAdminToken(data.token);
      localStorage.setItem("adminToken", data.token);
      navigate("/dashboard");

    } catch (error) {
      toast.error("Login failed");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <form 
        onSubmit={submitHandler} 
        className="border p-6 rounded shadow w-80"
      >
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>

        <input
          type="email"
          placeholder="Admin Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-black text-white w-full py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
