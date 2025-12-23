import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import EmployerHeader from "../components/employer/EmployerHeader";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import skills from "../constants/skills";

const PostJob = () => {
  const { api, employerToken } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const editingJob = location.state && location.state.job ? location.state.job : null;
  const [formData, setFormData] = useState({
    title: editingJob?.title || "",
    location: editingJob?.location || "",
    salaryMin: editingJob?.salaryRange?.min || "",
    salaryMax: editingJob?.salaryRange?.max || "",
    requiredSkills: editingJob?.requiredSkills || [],
    experience: editingJob?.experience || "",
    jobType: editingJob?.jobType || "Full-time",
    description: editingJob?.description || "",
  });

  // If creating a new job (not editing), ensure employer documents are all verified before allowing access
  useEffect(() => {
    const checkDocs = async () => {
      if (editingJob) return; // allow editing
      try {
        const response = await api.get('/api/employer/documents', { headers: { token: employerToken } });
        const docs = response.data.documents || [];
        const hasUploaded = docs.length > 0;
        const allVerified = hasUploaded && docs.every(d => (d.status || '').toString().toLowerCase() === 'verified');
        if (!hasUploaded || !allVerified) {
            toast.warn(t('postJob.errors.missingDocs'));
            setTimeout(() => navigate('/employer/jobs'), 1200);
          }
      } catch (err) {
        toast.error('Failed to check documents.');
      }
    };
    checkDocs();
  }, []);

  const availableSkills = skills;

  const handleSkillToggle = (skill) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.includes(skill)
        ? formData.requiredSkills.filter((s) => s !== skill)
        : [...formData.requiredSkills, skill],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.jobType) {
      toast.error(t('postJob.errors.fillRequired'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        location: formData.location,
        salaryRange: {
          min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        },
        requiredSkills: formData.requiredSkills,
        experience: formData.experience,
        jobType: formData.jobType,
        description: formData.description,
      };

      if (editingJob) {
        // update existing job
        const response = await api.put(`/api/employer/job/${editingJob._id}`, payload, {
          headers: { token: employerToken },
        });
        if (response.data.success) {
          toast.success(t('postJob.success.updated'));
          navigate("/employer/jobs");
        }
      } else {
        const response = await api.post("/api/employer/job", payload, {
          headers: { token: employerToken },
        });
        if (response.data.success) {
          toast.success(t('postJob.success.posted'));
          navigate("/employer/jobs");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t('postJob.errors.postFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerHeader title={editingJob ? t('postJob.editTitle') : t('postJob.title')} showBack backTo="/employer/jobs" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('postJob.fields.title')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('postJob.placeholders.title')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('postJob.fields.location')}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('postJob.placeholders.location')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('postJob.fields.salaryMin')}
                </label>
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('postJob.fields.salaryMax')}
                </label>
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  placeholder="e.g., 80000"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('postJob.fields.jobType')}
                </label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Full-time">{t('postJob.jobTypes.fulltime')}</option>
                <option value="Part-time">{t('postJob.jobTypes.parttime')}</option>
                <option value="Contract">{t('postJob.jobTypes.contract')}</option>
                <option value="Internship">{t('postJob.jobTypes.internship')}</option>
              </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('postJob.fields.experience')}
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder={t('postJob.placeholders.experience')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('postJob.fields.requiredSkills')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableSkills.map((skill) => (
                  <label key={skill} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiredSkills.includes(skill)}
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
                {t('postJob.fields.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder={t('postJob.placeholders.description')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/employer/jobs")}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (editingJob ? t('postJob.labels.updating') : t('postJob.labels.posting')) : (editingJob ? t('postJob.labels.update') : t('postJob.labels.post'))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
