import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EmployerHeader from "../components/employer/EmployerHeader";
import { toast } from "react-toastify";

const MyJobs = () => {
  const { api, employerToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (!employerToken) {
      navigate("/");
      return;
    }
    fetchJobs();
  }, [employerToken]);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/api/employer/jobs", {
        headers: { token: employerToken },
      });
      if (response.data.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplicants = async (jobId) => {
    try {
      const response = await api.get(`/api/employer/job/${jobId}/applicants`, {
        headers: { token: employerToken },
      });
      if (response.data.success) {
        const job = jobs.find((j) => j._id === jobId);
        setSelectedJob({ ...job, applicants: response.data.applicants });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load applicants");
    }
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
        title="My Jobs"
        right={(
          <div className="flex gap-4">
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
                    toast.warn('You must upload at least one document and ensure none are pending or rejected. Please upload documents and wait for admin verification.');
                  }
                } catch (err) {
                  toast.error('Failed to check documents. Please try again.');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Post New Job
            </button>
          </div>
        )}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {jobs.length === 0 ? (
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No jobs posted yet</p>
            <button
              onClick={() => navigate("/employer/post-job")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          job.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{job.location}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {job.jobType}
                      </span>
                      {job.salaryRange?.min && job.salaryRange?.max && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          ₹{job.salaryRange.min.toLocaleString('en-IN')} - ₹{job.salaryRange.max.toLocaleString('en-IN')}
                        </span>
                      )}
                      {job.experience && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                          {job.experience}
                        </span>
                      )}
                    </div>
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {job.requiredSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {job.description && (
                      <p className="text-gray-700 mt-2 line-clamp-2">{job.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => fetchJobApplicants(job._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View Applicants ({job.applicants?.length || 0})
                    </button>
                    <button
                      onClick={() => navigate('/employer/post-job', { state: { job } })}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit Job
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applicants Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Applicants for {selectedJob.title}
              </h2>
              <button
                onClick={() => setSelectedJob(null)}
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
            <div className="p-6">
              {selectedJob.applicants && selectedJob.applicants.length > 0 ? (
                <div className="space-y-4">
                  {selectedJob.applicants.map((applicant, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {applicant.worker?.name || "Unknown"}
                          </h3>
                          <p className="text-sm text-gray-600">{applicant.worker?.email}</p>
                          {applicant.worker?.phone && (
                            <p className="text-sm text-gray-600">{applicant.worker.phone}</p>
                          )}
                          {applicant.worker?.address && (
                            <p className="text-sm text-gray-600">{applicant.worker.address}</p>
                          )}
                          {applicant.worker?.skills && applicant.worker.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {applicant.worker.skills.map((skill, skillIdx) => (
                                <span
                                  key={skillIdx}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No applicants yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
