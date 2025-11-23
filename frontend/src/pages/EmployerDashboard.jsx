import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EmployerHeader from "../components/employer/EmployerHeader";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const EmployerDashboard = () => {
  const { api, employerToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    verificationsGiven: 0,
    jobsPosted: 0,
    documentsVerified: 0,
    documentsUploaded: 0,
  });
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!employerToken) {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [employerToken]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/api/employer/dashboard/stats", {
        headers: { token: employerToken },
      });
      if (response.data.success) {
        // backend now returns documentsUploaded along with documentsVerified
        setStats(response.data.stats);
        setRecentVerifications(response.data.recentVerifications || []);
        setRecentJobs(response.data.recentJobs || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.loading', 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('common.loading', 'Loading...')}</div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-gray-50">
      <EmployerHeader title={t('employer.dashboard.title')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('employer.dashboard.stats.verificationsGiven')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verificationsGiven}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => navigate("/employer/verifications")}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              {t('employer.dashboard.recentVerifications.viewAll')}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('employer.dashboard.stats.jobsPosted')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.jobsPosted}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => navigate("/employer/jobs")}
              className="mt-4 text-sm text-green-600 hover:text-green-800"
            >
              {t('employer.dashboard.recentJobs.viewAll')}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('employer.dashboard.stats.documentsVerified')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.documentsVerified}{stats.documentsUploaded ? `/${stats.documentsUploaded}` : ''}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('employer.dashboard.quickActions.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/employer/create-verification")}
              className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow hover:bg-blue-700 transition text-left"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <div>
                  <p className="font-semibold">{t('employer.dashboard.quickActions.createVerification')}</p>
                    <p className="text-sm text-blue-100">{t('employer.dashboard.quickActions.createVerificationDesc')}</p>
                </div>
              </div>
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await api.get('/api/employer/documents', { headers: { token: employerToken } });
                  const docs = response.data.documents || [];
                  const hasUploaded = docs.length > 0;
                  const allVerified = hasUploaded && docs.every(d => (d.status || '').toString().toLowerCase() === 'verified');
                    if (hasUploaded && allVerified) {
                    navigate('/employer/post-job');
                  } else {
                    toast.warn(t('employer.dashboard.quickActions.postJobWarning'));
                  }
                } catch (err) {
                  toast.error(t('employer.dashboard.quickActions.postJobCheckFailed', 'Failed to check documents. Please try again.'));
                }
              }}
              className="bg-green-600 text-white px-6 py-4 rounded-lg shadow hover:bg-green-700 transition text-left"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <div>
                  <p className="font-semibold">{t('employer.dashboard.quickActions.postJob')}</p>
                  <p className="text-sm text-green-100">{t('employer.dashboard.quickActions.postJobDesc')}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Verifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{t('employer.dashboard.recentVerifications.title')}</h2>
            </div>
            <div className="p-6">
              {recentVerifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('employer.dashboard.recentVerifications.none')}</p>
              ) : (
                <div className="space-y-4">
                  {recentVerifications.map((verification) => (
                    <div key={verification._id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {verification.worker?.name || verification.employeeName}
                          </p>
                          <p className="text-sm text-gray-600">{verification.jobRole}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(verification.startDate).toLocaleDateString()} - {new Date(verification.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < verification.rating ? "text-yellow-400" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(verification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {recentVerifications.length > 0 && (
                <button
                  onClick={() => navigate("/employer/verifications")}
                  className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('employer.dashboard.recentVerifications.viewAll')}
                </button>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{t('employer.dashboard.recentJobs.title')}</h2>
            </div>
            <div className="p-6">
              {recentJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('employer.dashboard.recentJobs.none')}</p>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job._id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-600">{job.location}</p>
                          <p className="text-xs text-gray-500 mt-1">{job.jobType}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded ${
                            job.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {job.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {recentJobs.length > 0 && (
                <button
                  onClick={() => navigate("/employer/jobs")}
                  className="mt-4 w-full text-sm text-green-600 hover:text-green-800"
                >
                  {t('employer.dashboard.recentJobs.viewAll')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
