import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const PublicVerification = () => {
  const { qrToken } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchVerification();
  }, [qrToken]);

  const fetchVerification = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/verify/${qrToken}`);
      if (response.data.success) {
        setVerification(response.data.verification);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('publicVerification.notFound'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">{t('publicVerification.loading')}</div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('publicVerification.notFound')}</h1>
          <p className="text-gray-600">{t('publicVerification.invalidLink')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-8 h-8"
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
              <h1 className="text-3xl font-bold">{t('publicVerification.title')}</h1>
            </div>
            <p className="text-blue-100">{t('publicVerification.subtitle')}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Worker Info */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('publicVerification.employeeInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publicVerification.fullName')}</p>
                  <p className="text-lg text-gray-900">
                    {verification.worker?.name || verification.employeeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publicVerification.phoneNumber')}</p>
                  <p className="text-lg text-gray-900">
                    {verification.phoneNumber || verification.worker?.phone || "N/A"}
                  </p>
                </div>
                {verification.worker?.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('publicVerification.email')}</p>
                    <p className="text-lg text-gray-900">{verification.worker.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('publicVerification.jobDetails')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publicVerification.jobRole')}</p>
                  <p className="text-lg text-gray-900">{verification.jobRole}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publicVerification.typeOfWork')}</p>
                  <p className="text-lg text-gray-900">{verification.typeOfWork || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publicVerification.company')}</p>
                  <p className="text-lg text-gray-900">{verification.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publicVerification.experience')}</p>
                  <p className="text-lg text-gray-900">{verification.experience || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publicVerification.startDate')}</p>
                  <p className="text-lg text-gray-900">
                    {new Date(verification.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('publicVerification.endDate')}</p>
                  <p className="text-lg text-gray-900">
                    {new Date(verification.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {verification.skills && verification.skills.length > 0 && (
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('publicVerification.skillsDemonstrated')}</h2>
                <div className="flex flex-wrap gap-2">
                  {verification.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Performance */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('publicVerification.performanceEvaluation')}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">{t('publicVerification.rating')}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-8 h-8 ${
                          i < verification.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-lg font-semibold text-gray-900">
                      {verification.rating} / 5
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">{t('publicVerification.recommended')}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {verification.recommended || verification.recommendation || "N/A"}
                  </p>
                </div>
                {verification.feedback && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">{t('publicVerification.feedback')}</p>
                    <p className="text-lg text-gray-900 whitespace-pre-wrap">
                      {verification.feedback}
                    </p>
                  </div>
                )}
                {!verification.feedback && verification.comments && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">{t('publicVerification.comments')}</p>
                    <p className="text-lg text-gray-900 whitespace-pre-wrap">
                      {verification.comments}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Employer Info */}
            {verification.employer && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('publicVerification.verifiedBy')}</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{verification.employer.company}</p>
                  {verification.employer.email && (
                    <p className="text-sm text-gray-600">{verification.employer.email}</p>
                  )}
                  {verification.employer.phone && (
                    <p className="text-sm text-gray-600">{verification.employer.phone}</p>
                  )}
                  {verification.employer.address && (
                    <p className="text-sm text-gray-600">{verification.employer.address}</p>
                  )}
                </div>
              </div>
            )}

            {/* Verification Date */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                {t('publicVerification.issued')} {new Date(verification.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{t('publicVerification.footerText')}</p>
        </div>
      </div>
    </div>
  );
};

export default PublicVerification;
