import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* support optional username in URL: /user/dashboard and /user/dashboard/:username */}
        <Route path="/user/dashboard" element={<UserDashboard />} />

        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
      </Routes>

<ToastContainer />

    </>
  );
}

export default App;
