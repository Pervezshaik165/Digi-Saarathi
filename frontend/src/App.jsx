import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerProfile from "./pages/EmployerProfile";
import EmployerDocuments from "./pages/EmployerDocuments";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import CreateVerification from "./pages/CreateVerification";
import VerificationsGiven from "./pages/VerificationsGiven";
import PublicVerification from "./pages/PublicVerification";
import { ToastContainer } from "react-toastify";
import Documents from "./pages/Documents";
import UserProfile from "./pages/UserProfile";
import UserQR from "./pages/UserQR";
import UserLayout from "./layouts/UserLayout";
import Jobs from "./pages/Jobs";
import Schemes from "./pages/Schemes";

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Login />} />

        {/* USER DASHBOARD WITH NAVBAR */}
        <Route
          path="/user/dashboard"
          element={
            <UserLayout>
              <UserDashboard />
            </UserLayout>
          }
        />
        {/* USER Documents WITH NAVBAR */}
        <Route path="/user/documents" element={<UserLayout><Documents /></UserLayout>} />
        <Route path="/jobs" element={<UserLayout><Jobs /></UserLayout>} />
        <Route path="/user/jobs" element={<UserLayout><Jobs /></UserLayout>} />
        
        {/* USER PROFILE WITH NAVBAR */}
        <Route
          path="/user/profile"
          element={
            <UserLayout>
              <UserProfile />
            </UserLayout>
          }
        />
          <Route path="/user/qr" element={<UserLayout><UserQR /></UserLayout>} />
          <Route path="/user/schemes" element={<UserLayout><Schemes /></UserLayout>} />

        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/documents" element={<EmployerDocuments />} />
        <Route path="/employer/profile" element={<EmployerProfile />} />
        <Route path="/employer/post-job" element={<PostJob />} />
        <Route path="/employer/jobs" element={<MyJobs />} />
        <Route path="/employer/create-verification" element={<CreateVerification />} />
        <Route path="/employer/verifications" element={<VerificationsGiven />} />

        {/* Public verification link */}
        <Route path="/verify/:qrToken" element={<PublicVerification />} />
      </Routes>
    </>
  );
}

export default App;
