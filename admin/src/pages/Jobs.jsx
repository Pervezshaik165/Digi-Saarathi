import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";

const Jobs = () => {
  const { api } = useContext(AdminContext);
  const [jobs, setJobs] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", location: "", jobType: "Full-time", employer: "", description: "", salaryMin: "", salaryMax: "", experience: "", skills: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const f = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/admin/jobs");
        setJobs(data.jobs || []);
        // fetch employers for create form
        try {
          const res = await api.get('/api/admin/employers');
          setEmployers(res.data.employers || []);
        } catch (ee) {
          // ignore employers fetch failure
        }
      } catch (e) {
        console.error("Failed to load jobs:", e);
        toast.error("Failed to load jobs from server");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    f();
  }, [api]);

  const toggle = (id) => toast.info(`Toggle active for job ${id}`);

  const handleToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'closed' : 'active';
      const { data } = await api.put(`/api/admin/jobs/${id}/status`, { status: newStatus });
      // update single job in state
      setJobs((prev) => prev.map((j) => (j.id === id ? (data.job || j) : j)));
    } catch (e) {
      console.error('Toggle job status failed', e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    try {
      await api.delete(`/api/admin/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (e) {
      console.error('Delete job failed', e);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const salaryRange = {
        min: form.salaryMin ? Number(form.salaryMin) : undefined,
        max: form.salaryMax ? Number(form.salaryMax) : undefined,
      };

      const requiredSkills = form.skills
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: form.title,
        location: form.location,
        jobType: form.jobType,
        employer: form.employer,
        description: form.description,
        salaryRange,
        requiredSkills,
        experience: form.experience,
      };
      const { data } = await api.post('/api/admin/jobs', payload);
      if (data && data.job) {
        setJobs((prev) => [data.job, ...prev]);
        setForm({ title: '', location: '', jobType: 'Full-time', employer: '', description: '', salaryMin: '', salaryMax: '', experience: '', skills: '' });
        setShowForm(false);
      }
    } catch (e) {
      console.error('Create job failed', e);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Jobs Overview</h2>

      {loading ? (
        <div className="text-slate-600">Loading jobs...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Showing {jobs.length} job(s)</div>
            <div>
              <button onClick={() => setShowForm((s) => !s)} className="px-3 py-1 border rounded">{showForm ? 'Cancel' : 'Add Job'}</button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="bg-white rounded p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Job title" className="border p-2" />
                <input required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location" className="border p-2" />
                <select value={form.jobType} onChange={(e) => setForm((f) => ({ ...f, jobType: e.target.value }))} className="border p-2">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
                <select required value={form.employer} onChange={(e) => setForm((f) => ({ ...f, employer: e.target.value }))} className="border p-2">
                  <option value="">Select employer</option>
                  {employers.map((em) => (
                    <option key={em._id} value={em._id}>{em.company}</option>
                  ))}
                </select>
                <input value={form.salaryMin} onChange={(e) => setForm((f) => ({ ...f, salaryMin: e.target.value }))} placeholder="Salary min" type="number" className="border p-2" />
                <input value={form.salaryMax} onChange={(e) => setForm((f) => ({ ...f, salaryMax: e.target.value }))} placeholder="Salary max" type="number" className="border p-2" />
                <input value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} placeholder="Experience (years)" type="number" className="border p-2" />
                <input value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} placeholder="Skills required (comma separated)" className="border p-2 col-span-2" />
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className="col-span-2 border p-2" />
              </div>
              <div className="mt-3">
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Create Job</button>
              </div>
            </form>
          )}

          {jobs.length === 0 ? (
            <div className="text-slate-600">No jobs found.</div>
          ) : (
            jobs.map((j) => (
              <div key={j.id} className="bg-slate-50 rounded-xl p-6 shadow-sm flex items-start justify-between">
                <div>
                  <div className="font-semibold">{j.title}</div>
                  <div className="text-sm text-slate-600">{j.employer} • {j.category}</div>
                  <div className="text-xs text-slate-500 mt-3">Posted<br/>{j.postedAt ? new Date(j.postedAt).toLocaleString() : '—'}</div>
                </div>

                <div className="flex flex-col items-end space-y-4">
                  <div className="text-sm text-slate-500">{j.status === 'Active' ? 'Active' : 'Inactive'}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(j.id, j.status)} className="px-3 py-1 border rounded">{j.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => handleDelete(j.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Jobs;
