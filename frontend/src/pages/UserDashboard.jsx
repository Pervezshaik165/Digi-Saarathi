import React, { useContext, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const StatCard = ({ title, value, link, color = "bg-white" }) => (
  <div className={`p-4 rounded-lg shadow-sm ${color} border`}>
    <div className="text-sm text-gray-500">{title}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    {link && (
      <div className="mt-3">
        <Link to={link} className="text-indigo-600 text-sm">
          View
        </Link>
      </div>
    )}
  </div>
);

const SmallItem = ({ title, subtitle, to }) => (
  <Link to={to || '#'} className="block p-3 hover:bg-gray-50 rounded">
    <div className="text-sm font-medium">{title}</div>
    {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
  </Link>
);

const UserDashboard = () => {
  const { userName, userProfile, loadUserProfile, refreshDocs, api, userToken } = useContext(AppContext);

  const [userDocs, setUserDocs] = useState([]);
  const [publicJobs, setPublicJobs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    // ensure profile is loaded when dashboard mounts
    loadUserProfile && loadUserProfile();

    // initial load and start polling for realtime updates every 15 seconds
    loadUserDocuments();
    loadPublicJobs();

    const t = setInterval(() => {
      loadUserProfile && loadUserProfile();
      loadUserDocuments();
      loadPublicJobs();
    }, 15000);

    return () => clearInterval(t);
  }, [loadUserProfile]);

  // reload when other parts of the app signal a documents refresh
  useEffect(() => {
    if (refreshDocs) {
      loadUserProfile && loadUserProfile();
      loadUserDocuments();
    }
  }, [refreshDocs, loadUserProfile]);

  // fetch user documents (from DocumentModel) so we have verification status
  async function loadUserDocuments() {
    if (!userToken) return;
    setLoadingDocs(true);
    try {
      const { data } = await api.get("/api/user/documents", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (data && data.success) {
        setUserDocs(Array.isArray(data.documents) ? data.documents : []);
      }
    } catch (e) {
      console.error("Failed to load user documents:", e.message || e);
    } finally {
      setLoadingDocs(false);
    }
  }

  // fetch public jobs (we will filter which ones the user applied to)
  async function loadPublicJobs() {
    setLoadingJobs(true);
    try {
      const { data } = await api.get("/api/public/jobs");
      if (data && data.success) {
        setPublicJobs(Array.isArray(data.jobs) ? data.jobs : []);
      }
    } catch (e) {
      console.error("Failed to load public jobs:", e.message || e);
    } finally {
      setLoadingJobs(false);
    }
  }

  const documents = userDocs || [];
  const verifications = documents.filter((d) => d.status === "verified");

  const appliedJobs = useMemo(() => {
    if (!userProfile?._id) return [];
    return publicJobs.filter((j) =>
      Array.isArray(j.applicants) && j.applicants.some((a) => String(a.worker) === String(userProfile._id))
    );
  }, [publicJobs, userProfile]);

  // compute profile completion locally based on presence of common profile fields
  const profileCompletion = useMemo(() => {
    const checks = [
      (u) => !!u?.phone,
      (u) => !!u?.image,
      (u) => !!u?.dob,
      (u) => !!u?.gender,
      (u) => !!u?.originState,
      (u) => !!u?.originDistrict,
      (u) => !!u?.currentState,
      (u) => !!u?.currentDistrict,
      (u) => !!u?.presentCity,
      (u) => !!u?.experience,
      (u) => !!u?.address,
      (u) => Array.isArray(u?.skills) && u.skills.length > 0,
      // documents presence
      () => documents.length > 0,
      // skill certificate flag if present on profile
      (u) => !!u?.skillCertificatePresent,
    ];

    const total = checks.length;
    let filled = 0;
    checks.forEach((fn) => {
      try {
        if (fn(userProfile)) filled++;
      } catch (e) {
        // ignore
      }
    });

    return Math.round((filled / total) * 100);
  }, [userProfile, documents]);

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{`Welcome ${userName || userProfile?.name || 'User'}`}</h1>
          <p className="text-sm text-gray-600 mt-1">Overview of your account and recent activity</p>
        </div>
        {/* header action links removed because they are available in the navbar */}
        <div />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Profile Completion" value={`${Math.min(100, profileCompletion ?? 0)}%`} link="/user/profile" />
        <StatCard title="Documents" value={documents.length} link="/user/documents" />
        <StatCard title="Verifications" value={verifications.length} link="/user/documents" />
        <StatCard title="Applied Jobs" value={appliedJobs.length} link="/user/jobs" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border rounded p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Documents</h2>
            <Link to="/user/documents" className="text-sm text-indigo-600">See all</Link>
          </div>
          <div className="divide-y">
            {documents.length ? (
              documents.slice(0,3).map((d, idx) => (
                <SmallItem
                  key={idx}
                  title={d.type || d.title || `Document ${idx+1}`}
                  subtitle={`${d.status ? d.status : ""} ${d.createdAt ? '· ' + new Date(d.createdAt).toLocaleDateString() : ''}`}
                  to={`/documents`}
                />
              ))
            ) : (
                <div className="p-6 text-center text-gray-500">No documents uploaded yet. <Link to="/user/documents" className="text-indigo-600">Upload now</Link></div>
            )}
          </div>
        </div>

        <aside className="bg-white border rounded p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Profile Summary</h3>
          <div className="text-sm text-gray-700">
            <div><strong>Name:</strong> {userProfile?.name || userName || '—'}</div>
            <div><strong>Email:</strong> {userProfile?.email || '—'}</div>
            <div><strong>Phone:</strong> {userProfile?.phone || '—'}</div>
            <div className="mt-3">
              <Link to="/user/profile" className="text-indigo-600 text-sm">Edit Profile</Link>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border rounded p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Verifications</h3>
            <Link to="/user/documents" className="text-sm text-indigo-600">See all</Link>
          </div>
          <div className="divide-y">
            {verifications.length ? (
              verifications.slice(0,3).map((v, i) => (
                <SmallItem key={i} title={v.type || v.title || `Verification ${i+1}`} subtitle={v.status || ''} to="/user/documents" />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No verifications yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Jobs</h3>
            <Link to="/user/jobs" className="text-sm text-indigo-600">See all</Link>
          </div>
          <div className="divide-y">
            {appliedJobs.length ? (
              appliedJobs.slice(0,3).map((j, k) => (
                <SmallItem key={k} title={j.title || `Job ${k+1}`} subtitle={j.employer?.company || j.company || ''} to="/user/jobs" />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No recent job activity.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
