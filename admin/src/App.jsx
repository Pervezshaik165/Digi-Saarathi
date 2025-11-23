import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import Employers from "./pages/Employers";
import EmployerDetails from "./pages/EmployerDetails";
import Workers from "./pages/Workers";
import WorkerProfile from "./pages/WorkerProfile";
import Documents from "./pages/Documents";
import Verifications from "./pages/Verifications";
import EmployerDocuments from "./pages/EmployerDocuments";
import Jobs from "./pages/Jobs";
import { useContext } from "react";
import { AdminContext } from "./context/AdminContext";

function App() {
  const { adminToken } = useContext(AdminContext);

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* protected routes */}
      <Route
        path="/"
        element={adminToken ? <AdminLayout /> : <Navigate to="/" replace />}
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employers" element={<Employers />} />
        <Route path="employers/:id" element={<EmployerDetails />} />
        <Route path="workers" element={<Workers />} />
        <Route path="workers/:id" element={<WorkerProfile />} />
        <Route path="documents" element={<Documents />} />
        <Route path="employer-documents" element={<EmployerDocuments />} />
        <Route path="verifications" element={<Verifications />} />
        <Route path="jobs" element={<Jobs />} />
      </Route>
    </Routes>
  );
}

export default App;
