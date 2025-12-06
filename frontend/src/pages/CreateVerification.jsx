import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EmployerHeader from "../components/employer/EmployerHeader";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";

const CreateVerification = () => {
  const { api, employerToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [workersList, setWorkersList] = useState([]);
  const [formData, setFormData] = useState({
    employeeName: "",
    phoneNumber: "",
    jobRole: "",
    typeOfWork: "Full-time",
    skills: [],
    experience: "",
    startDate: "",
    endDate: "",
    rating: 5,
    recommended: "Highly Recommend",
    feedback: "",
    workerId: "",
  });
  const { t } = useTranslation();

  const availableSkills = [
    "Communication",
    "Teamwork",
    "Problem Solving",
    "Leadership",
    "Time Management",
    "Customer Service",
    "Cash Handling",
    "Market Trading",
    "Food Vending",
    "Tailoring",
    "Carpentry",
    "Woodworking",
    "Agricultural Work",
    "Electrician",
    "Electrical Wiring",
    "Plumbing",
    "Masonry",
    "Bricklaying",
    "Housekeeping",
    "Cleaning",
    "Cooking",
    "Childcare",
    "Load Handling",
    "Tool Maintenance",
    "Machine Operation",
    "Driving",
    "Scaffolding Safety",
  ];

  const handleSkillToggle = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.includes(skill)
        ? formData.skills.filter((s) => s !== skill)
        : [...formData.skills, skill],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(
        "/api/employer/verification",
        formData,
        { headers: { token: employerToken } }
      );
      if (response.data.success) {
        setVerification(response.data.verification);
        toast.success(t('createVerification.createdSuccess'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create verification");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const f = async () => {
      try {
        const res = await api.get('/api/employer/workers/list', { headers: { token: employerToken } });
        if (res.data && res.data.users) setWorkersList(res.data.users);
      } catch (e) {
        // ignore
      }
    };
    f();
  }, [api, employerToken]);

  const verificationUrl = verification
    ? `${window.location.origin}/verify/${verification.qrToken}`
    : "";

  if (verification && showQRCode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerHeader title={t('createVerification.qrTitle')} showBack backTo="/employer/dashboard" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('createVerification.qrSuccess')}
                </h2>
                <p className="text-gray-600">
                  {t('createVerification.shareDesc')}
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <QRCodeSVG value={verificationUrl} size={256} />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('createVerification.verificationLinkLabel')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationUrl}
                    readOnly
                    className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(verificationUrl);
                        toast.success(t('createVerification.copySuccess'));
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                      {t('createVerification.copy')}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setVerification(null);
                    setShowQRCode(false);
                    setFormData({
                      employeeName: "",
                      phoneNumber: "",
                      jobRole: "",
                      typeOfWork: "Full-time",
                      skills: [],
                      experience: "",
                      startDate: "",
                      endDate: "",
                      rating: 5,
                      recommended: "Highly Recommend",
                      feedback: "",
                    });
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {t('createVerification.createAnother')}
                </button>
                <button
                  onClick={() => navigate("/employer/verifications")}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  {t('createVerification.viewAll', 'View All Verifications')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verification && !showQRCode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerHeader title={t('createVerification.createdTitle')} showBack backTo="/employer/dashboard" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('createVerification.createdSuccess')}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t('createVerification.createdDesc')}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowQRCode(true)}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  {t('createVerification.generateQRCode')}
                </button>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setVerification(null);
                      setShowQRCode(false);
                      setFormData({
                        employeeName: "",
                        phoneNumber: "",
                        jobRole: "",
                        typeOfWork: "Full-time",
                        skills: [],
                        experience: "",
                        startDate: "",
                        endDate: "",
                        rating: 5,
                        recommended: "Highly Recommend",
                        feedback: "",
                      });
                    }}
                    className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    {t('createVerification.createAnother')}
                  </button>
                  <button
                    onClick={() => navigate("/employer/verifications")}
                    className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    {t('createVerification.viewAll', 'View All Verifications')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <EmployerHeader title={t('createVerification.enterDetailsTitle', 'Create Work Verification')} showBack backTo="/employer/dashboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('createVerification.enterDetailsTitle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createVerification.employeeFullName', 'Employee Full Name *')}
              </label>
              <select
                value={formData.workerId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  // handle 'other' specially to allow manual input
                  if (selectedId === 'other' || selectedId === '') {
                    setFormData({ ...formData, workerId: selectedId, employeeName: '', phoneNumber: '' });
                    return;
                  }
                  const user = workersList.find((u) => u._id === selectedId);
                  if (user) {
                    setFormData({ ...formData, workerId: selectedId, employeeName: user.name, phoneNumber: user.phone || '' });
                  } else {
                    setFormData({ ...formData, workerId: '', employeeName: '', phoneNumber: '' });
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t('createVerification.selectWorkerPlaceholder', '-- Select worker --')}</option>
                {workersList.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}{w.phone ? ` — ${w.phone}` : ''}</option>
                ))}
                <option value="other">{t('createVerification.otherNotInList', 'Other / Not in list')}</option>
              </select>

              {formData.workerId === 'other' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('createVerification.employeeFullName', 'Employee Full Name *')}</label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createVerification.phoneNumber', 'Phone Number *')}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder={t('createVerification.phonePlaceholder', 'e.g., +1234567890')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createVerification.jobRole', 'Job Role/Position *')}
              </label>
              <input
                type="text"
                value={formData.jobRole}
                onChange={(e) =>
                  setFormData({ ...formData, jobRole: e.target.value })
                }
                placeholder={"e.g., Electritian, Mason"}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createVerification.typeOfWork', 'Type of Work *')}
              </label>
              <select
                value={formData.typeOfWork}
                onChange={(e) =>
                  setFormData({ ...formData, typeOfWork: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Full-time">{t('createVerification.typeOptions.fulltime', 'Full-time')}</option>
                <option value="Part-time">{t('createVerification.typeOptions.parttime', 'Part-time')}</option>
                <option value="Contract">{t('createVerification.typeOptions.contract', 'Contract')}</option>
                <option value="Internship">{t('createVerification.typeOptions.internship', 'Internship')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createVerification.skillsLabel', 'Skills Demonstrated')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableSkills.map((skill) => (
                  <label key={skill} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="mr-2"
                    />
                    <span className="text-sm">{t(`createVerification.skills.${skill}`, skill)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createVerification.experienceLabel', 'Experience *')}
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
                placeholder={t('createVerification.placeholders.experience', 'e.g., 0-2 years, 2-5 years, 5+ years')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createVerification.startDate', 'Start Date *')}
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createVerification.endDate', 'End Date *')}
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createVerification.ratingLabel', 'Performance Rating *')} ({formData.rating} {t('createVerification.ratingSuffix', 'stars')})
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createVerification.recommendedLabel', 'Recommended *')}
              </label>
              <select
                value={formData.recommended}
                onChange={(e) =>
                  setFormData({ ...formData, recommended: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Highly Recommend">{t('createVerification.recommendedOptions.highly', 'Highly Recommend')}</option>
                <option value="Recommend">{t('createVerification.recommendedOptions.recommend', 'Recommend')}</option>
                <option value="Neutral">{t('createVerification.recommendedOptions.neutral', 'Neutral')}</option>
                <option value="Not Recommend">{t('createVerification.recommendedOptions.not', 'Not Recommend')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createVerification.feedbackLabel', 'Feedback *')}
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) =>
                  setFormData({ ...formData, feedback: e.target.value })
                }
                rows={4}
                placeholder={t('createVerification.feedbackPlaceholder', "Provide detailed feedback about the worker's performance, achievements, and overall work quality...")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/employer/dashboard")}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {t('createVerification.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? t('createVerification.creating', 'Creating...') : t('createVerification.createVerification', 'Create Verification')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateVerification;
