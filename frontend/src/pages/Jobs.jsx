import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import AIJobSearchBox from '../components/AIJobSearchBox';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const JobCard = ({ job, onView }) => {
  const { t } = useTranslation();
  return (
  <div className="bg-white border rounded p-4 shadow-sm">
    <div className="flex justify-between">
      <div>
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <p className="text-sm text-gray-600">{job.employer?.company} • {job.location}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{job.jobType}</span>
          {job.salaryRange?.min && job.salaryRange?.max && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">₹{job.salaryRange.min.toLocaleString('en-IN')} - ₹{job.salaryRange.max.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={() => onView(job)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">{t('jobs.view')}</button>
        <span className={`px-2 py-1 text-xs rounded ${job.status==='active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{job.status}</span>
      </div>
    </div>
  </div>
  );
};

const Jobs = () => {
  const { api, backendUrl, userToken, userProfile } = useContext(AppContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/api/public/jobs');
      if (res.data.success) setJobs(res.data.jobs || []);
    } catch (err) {
      toast.error(t('jobs.errors.fetchFailed', 'Failed to load jobs'));
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId) => {
    if (!userToken) {
      toast.info(t('jobs.errors.loginToApply', 'Please login to apply'));
      return;
    }
    try {
      const res = await api.post(`/api/public/jobs/${jobId}/apply`, {}, { headers: { token: userToken } });
      if (res.data.success) {
        toast.success(t('jobs.success.applied', 'Applied successfully'));
        // refresh jobs from server to get canonical applicant list (prevents duplicates)
        await fetchJobs();
        setSelectedJob(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('jobs.errors.applyFailed', 'Failed to apply'));
    }
  };


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">{t('jobs.title')}</h1>
      </div>

      <AIJobSearchBox />

      {/* Visual separation between AI recommendations and full jobs list */}
      <div className="my-8">
        <hr className="border-t border-gray-200" />
      </div>

      {loading ? (
        <div className="bg-white p-8 rounded shadow text-center">{t('jobs.loading')}</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center">{t('jobs.noJobs')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <JobCard key={job._id} job={job} onView={(j) => setSelectedJob(j)} />
          ))}
        </div>
      )}

      {/* Job Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedJob.title}</h2>
                <p className="text-sm text-gray-600">{selectedJob.employer?.company} • {selectedJob.location}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-gray-500">{t('jobs.close')}</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{selectedJob.jobType}</span>
                {selectedJob.salaryRange?.min && selectedJob.salaryRange?.max && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">₹{selectedJob.salaryRange.min.toLocaleString('en-IN')} - ₹{selectedJob.salaryRange.max.toLocaleString('en-IN')}</span>
                )}
                {selectedJob.experience && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{selectedJob.experience}</span>
                )}
                <span className={`text-xs px-2 py-1 rounded ${selectedJob.status==='active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{selectedJob.status}</span>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t('jobs.description')}</h4>
                <p className="text-gray-700">{selectedJob.description || t('jobs.noDescription')}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t('jobs.requiredSkills')}</h4>
                {selectedJob.requiredSkills && selectedJob.requiredSkills.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((s, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{s}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{t('jobs.noSkills')}</div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">{t('jobs.details')}</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div><strong>{t('jobs.location')}:</strong> {selectedJob.location || '—'}</div>
                    <div><strong>{t('jobs.type')}:</strong> {selectedJob.jobType || '—'}</div>
                    <div><strong>{t('jobs.experience')}:</strong> {selectedJob.experience || '—'}</div>
                    <div><strong>{t('jobs.posted')}:</strong> {new Date(selectedJob.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t('jobs.application')}</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div><strong>{t('jobs.applicants')}:</strong> {selectedJob.applicants?.length || 0}</div>
                    <div><strong>{t('jobs.verification')}:</strong> {selectedJob.verification || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center gap-3">
                {(() => {
                  const myApplication = (selectedJob.applicants || []).find(a => String(a.worker) === String(userProfile?._id));
                  if (!myApplication) {
                      return (
                      <button onClick={() => applyToJob(selectedJob._id)} className="px-4 py-2 bg-indigo-600 text-white rounded">{t('jobs.apply')}</button>
                    );
                  }

                  if (myApplication.status === 'applied') {
                    return (
                      <button disabled className="px-4 py-2 bg-gray-300 text-gray-700 rounded">{t('jobs.applied')}</button>
                    );
                  }

                  if (myApplication.status === 'accepted') {
                    return (
                      <div className="text-green-600 font-semibold">{t('jobs.accepted')}</div>
                    );
                  }

                  if (myApplication.status === 'rejected') {
                    return (
                      <>
                        <div className="text-red-600 font-semibold">{t('jobs.rejected')}</div>
                        <button onClick={() => applyToJob(selectedJob._id)} className="px-4 py-2 bg-indigo-600 text-white rounded">{t('jobs.apply')}</button>
                      </>
                    );
                  }

                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
