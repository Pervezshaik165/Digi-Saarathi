import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EmployerHeader from "../components/employer/EmployerHeader";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';

const EmployerProfile = () => {
  const { api, employerToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
    const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    company: "",
    phone: "",
    address: "",
    industry: "",
    location: "",
  });

  useEffect(() => {
    if (!employerToken) {
      navigate("/");
      return;
    }
    fetchProfile();
  }, [employerToken]);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/employer/profile", {
        headers: { token: employerToken },
      });
      if (response.data.success) {
        const emp = response.data.employer;
        setEmployer(emp);
        setFormData({
          company: emp.company || "",
          phone: emp.phone || "",
          address: emp.address || "",
          industry: emp.industry || "",
          location: emp.location || "",
        });
        // fetch employer documents to show verification status
        try {
          const docsRes = await api.get("/api/employer/documents", { headers: { token: employerToken } });
          if (docsRes.data.success) setDocuments(docsRes.data.documents || []);
        } catch (e) {
          // ignore docs fetch errors (non-blocking)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('employer.profile.loadFailed', 'Failed to load profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/api/employer/profile", formData, {
        headers: { token: employerToken },
      });
      if (response.data.success) {
        setEmployer(response.data.employer);
        setEditing(false);
        toast.success(t('employer.profile.updated', 'Profile updated successfully'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('employer.profile.updateFailed', 'Failed to update profile'));
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
    <div className="min-h-screen bg-gray-50">
      <EmployerHeader title={t('employer.profile.title', 'Employer Profile')} showBack backTo="/employer/dashboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{t('employer.profile.companyDetails', 'Company Details')}</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t('employer.profile.editProfile', 'Edit Profile')}
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Document Verification Status Badge */}
            <div className="mb-6">
              {(() => {
                const docs = documents || [];
                let badgeLabel = t('employer.profile.noDocuments');
                let badgeClass = "bg-gray-100 text-gray-800";
                let helperText = t('employer.profile.noDocuments.helper');

                if (docs.length > 0) {
                  const allVerified = docs.every((d) => (d.status || '').toLowerCase() === 'verified');
                  const anyRejected = docs.some((d) => (d.status || '').toLowerCase() === 'rejected');
                  const anyPending = docs.some((d) => (d.status || '').toLowerCase() === 'pending');

                  if (allVerified) {
                    badgeLabel = t('employer.profile.verified');
                    badgeClass = "bg-green-100 text-green-800";
                    helperText = t('employer.profile.verifiedHelper');
                  } else if (anyRejected) {
                    badgeLabel = t('employer.profile.rejected');
                    badgeClass = "bg-red-100 text-red-800";
                    helperText = t('employer.profile.rejectedHelper');
                  } else if (anyPending) {
                    badgeLabel = t('employer.profile.pendingVerification');
                    badgeClass = "bg-yellow-100 text-yellow-800";
                    helperText = t('employer.profile.pendingHelper');
                  } else {
                    badgeLabel = t('employer.profile.pendingVerification');
                    badgeClass = "bg-yellow-100 text-yellow-800";
                    helperText = t('employer.profile.pendingHelper');
                  }
                }

                return (
                  <>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
                      {t('employer.profile.documentStatus', 'Document Status')}: {badgeLabel}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">{helperText}</p>
                  </>
                );
              })()}
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employer.profile.companyName', 'Company Name')}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={employer?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('employer.profile.emailCannotChange', 'Email cannot be changed')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employer.profile.phone', 'Phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employer.profile.address', 'Address')}
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employer.profile.industry', 'Industry')}
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employer.profile.location', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {t('employer.profile.saveChanges', 'Save Changes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        company: employer?.company || "",
                        phone: employer?.phone || "",
                        address: employer?.address || "",
                        industry: employer?.industry || "",
                        location: employer?.location || "",
                      });
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      {t('common.cancel', 'Cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('employer.profile.companyName')}</p>
                  <p className="text-lg text-gray-900">{employer?.company || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg text-gray-900">{employer?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('employer.profile.phone')}</p>
                  <p className="text-lg text-gray-900">{employer?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('employer.profile.address')}</p>
                  <p className="text-lg text-gray-900">{employer?.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('employer.profile.industry')}</p>
                  <p className="text-lg text-gray-900">{employer?.industry || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('employer.profile.location')}</p>
                  <p className="text-lg text-gray-900">{employer?.location || "N/A"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
