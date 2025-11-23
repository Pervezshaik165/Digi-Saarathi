import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EmployerHeader from "../components/employer/EmployerHeader";
import { toast } from "react-toastify";

const VerificationsGiven = () => {
  const { api, employerToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);

  useEffect(() => {
    if (!employerToken) {
      navigate("/");
      return;
    }
    fetchVerifications();
  }, [employerToken]);

  const fetchVerifications = async () => {
    try {
      const response = await api.get("/api/employer/verifications", {
        headers: { token: employerToken },
      });
      if (response.data.success) {
        setVerifications(response.data.verifications || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  const copyVerificationLink = (qrToken) => {
    const link = `${window.location.origin}/verify/${qrToken}`;
    navigator.clipboard.writeText(link);
    toast.success("Verification link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerHeader
        title="Verifications Given"
        right={(
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/employer/create-verification")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Create New
            </button>
          </div>
        )}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {verifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No verifications yet</p>
            <button
              onClick={() => navigate("/employer/create-verification")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Verification
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verifications.map((verification) => (
                    <tr key={verification._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {verification.worker?.name || verification.employeeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {verification.worker?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{verification.jobRole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(verification.startDate).toLocaleDateString()} -{" "}
                          {new Date(verification.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < verification.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(verification.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedVerification(verification)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => copyVerificationLink(verification.qrToken)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Copy Link
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Verification Details
              </h2>
              <button
                onClick={() => setSelectedVerification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Worker Name</p>
                <p className="text-lg text-gray-900">
                  {selectedVerification.worker?.name || selectedVerification.employeeName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="text-lg text-gray-900">
                  {selectedVerification.phoneNumber || selectedVerification.worker?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Job Role</p>
                <p className="text-lg text-gray-900">{selectedVerification.jobRole}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Type of Work</p>
                <p className="text-lg text-gray-900">{selectedVerification.typeOfWork || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Company</p>
                <p className="text-lg text-gray-900">{selectedVerification.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Experience</p>
                <p className="text-lg text-gray-900">{selectedVerification.experience || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Employment Period</p>
                <p className="text-lg text-gray-900">
                  {new Date(selectedVerification.startDate).toLocaleDateString()} -{" "}
                  {new Date(selectedVerification.endDate).toLocaleDateString()}
                </p>
              </div>
              {selectedVerification.skills && selectedVerification.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Skills</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedVerification.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${
                        i < selectedVerification.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Recommended</p>
                <p className="text-lg text-gray-900">
                  {selectedVerification.recommended || selectedVerification.recommendation || "N/A"}
                </p>
              </div>
              {selectedVerification.feedback && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Feedback</p>
                  <p className="text-lg text-gray-900 whitespace-pre-wrap">{selectedVerification.feedback}</p>
                </div>
              )}
              {!selectedVerification.feedback && selectedVerification.comments && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Comments</p>
                  <p className="text-lg text-gray-900 whitespace-pre-wrap">{selectedVerification.comments}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Verification Link</p>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/verify/${selectedVerification.qrToken}`}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => copyVerificationLink(selectedVerification.qrToken)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationsGiven;
