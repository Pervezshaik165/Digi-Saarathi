import React, { useContext, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, link, accent = 'indigo' }) => {
  const { t } = useTranslation();
  const accentBg = {
    indigo: 'from-indigo-50 to-white text-indigo-700',
    teal: 'from-teal-50 to-white text-teal-700',
    amber: 'from-amber-50 to-white text-amber-700',
    rose: 'from-rose-50 to-white text-rose-700',
  }[accent] || 'from-gray-50 to-white text-gray-700';

  return (
    <div className={`p-4 rounded-lg shadow-sm border bg-gradient-to-br ${accentBg}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full bg-white/60 flex items-center justify-center shadow-sm`}>
            <svg className={`w-6 h-6 text-current`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="3"></circle><path d="M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path></svg>
          </div>
        </div>
      </div>

      {link && (
        <div className="mt-3">
          <Link to={link} className="text-sm font-medium text-indigo-600">
            {t('view')}
          </Link>
        </div>
      )}
    </div>
  );
};

const SmallItem = ({ title, subtitle, to }) => (
  <Link to={to || '#'} className="block p-3 hover:bg-gray-50 rounded flex items-start gap-3">
    <div className="w-9 h-9 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">{(title || '').charAt(0)}</div>
    <div className="flex-1">
      <div className="text-sm font-medium">{title}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  </Link>
);

const UserDashboard = () => {
  const { userName, userProfile, loadUserProfile, refreshDocs, api, userToken } = useContext(AppContext);
  const { t } = useTranslation();

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
      <header className="mb-6 rounded-lg p-6 bg-gradient-to-r from-indigo-50 via-white to-teal-50 border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 text-white flex items-center justify-center text-2xl font-semibold shadow-md">
              {userProfile?.name ? (userProfile.name.split(' ').map(s=>s[0]).slice(0,2).join('')) : (userName||'U').charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">{t('dashboard.welcome', { name: userName || userProfile?.name || t('dashboard.userDefault') })}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('dashboard.overview')}</p>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end">
            <div className="text-sm text-gray-500">{t('dashboard.profileCompletion')}</div>
            <div className="mt-2 w-48 bg-white rounded-full h-3 shadow-inner overflow-hidden border">
              <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-teal-400" style={{ width: `${Math.min(100, profileCompletion ?? 0)}%` }} />
            </div>
            <div className="text-xs text-gray-600 mt-1">{Math.min(100, profileCompletion ?? 0)}%</div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard accent="indigo" title={t('dashboard.profileCompletion')} value={`${Math.min(100, profileCompletion ?? 0)}%`} link="/user/profile" />
        <StatCard accent="teal" title={t('dashboard.documents')} value={documents.length} link="/user/documents" />
        <StatCard accent="amber" title={t('dashboard.verifications')} value={verifications.length} link="/user/documents" />
        <StatCard accent="rose" title={t('dashboard.appliedJobs')} value={appliedJobs.length} link="/user/jobs" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-indigo-50 border rounded p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{t('dashboard.recentDocuments')}</h2>
            <Link to="/user/documents" className="text-sm text-indigo-600">{t('seeAll')}</Link>
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
                <div className="p-6 text-center text-gray-500">{t('dashboard.noDocs')} <Link to="/user/documents" className="text-indigo-600">{t('dashboard.uploadNow')}</Link></div>
            )}
          </div>
        </div>

        <aside className="bg-gradient-to-br from-white to-rose-50 border rounded p-4 shadow-sm">
          <h3 className="font-semibold mb-3">{t('dashboard.profileSummary')}</h3>
          <div className="text-sm text-gray-700">
            <div><strong>{t('dashboard.name')}:</strong> {userProfile?.name || userName || '—'}</div>
            <div><strong>{t('dashboard.email')}:</strong> {userProfile?.email || '—'}</div>
            <div><strong>{t('dashboard.phone')}:</strong> {userProfile?.phone || '—'}</div>
            <div className="mt-3">
              <Link to="/user/profile" className="text-indigo-600 text-sm">{t('dashboard.editProfile')}</Link>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gradient-to-br from-white to-amber-50 border rounded p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{t('dashboard.recentVerifications')}</h3>
            <Link to="/user/documents" className="text-sm text-indigo-600">{t('seeAll')}</Link>
          </div>
          <div className="divide-y">
            {verifications.length ? (
              verifications.slice(0,3).map((v, i) => (
                <SmallItem key={i} title={v.type || v.title || `Verification ${i+1}`} subtitle={v.status || ''} to="/user/documents" />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">{t('dashboard.noVerifications')}</div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-teal-50 border rounded p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{t('dashboard.recentJobs')}</h3>
            <Link to="/user/jobs" className="text-sm text-indigo-600">{t('seeAll')}</Link>
          </div>
          <div className="divide-y">
            {appliedJobs.length ? (
              appliedJobs.slice(0,3).map((j, k) => (
                <SmallItem key={k} title={j.title || `Job ${k+1}`} subtitle={j.employer?.company || j.company || ''} to="/user/jobs" />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">{t('dashboard.noRecentJobs')}</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
