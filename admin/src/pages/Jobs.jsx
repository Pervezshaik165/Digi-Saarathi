import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";

const sample = [
  { id: "j1", title: "Fix plumbing", employer: "Alice Co", category: "Plumbing", status: "Active" },
  { id: "j2", title: "Build shelf", employer: "Bob Ltd", category: "Carpentry", status: "Inactive" },
];

const Jobs = () => {
  const { api } = useContext(AdminContext);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const f = async () => {
      try {
        const { data } = await api.get("/api/admin/jobs");
        setJobs(data.jobs || []);
      } catch (e) {
        setJobs(sample);
      }
    };
    f();
  }, [api]);

  const toggle = (id) => toast.info(`Toggle active for job ${id}`);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Jobs Overview</h2>

      <div className="space-y-6">
        {jobs.map((j) => (
          <div key={j.id} className="bg-slate-50 rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <div className="font-semibold">{j.title}</div>
              <div className="text-sm text-slate-600">{j.employer} • {j.category}</div>
              <div className="text-xs text-slate-500 mt-3">Posted<br/>11/18/2025, 10:33:22 PM</div>
            </div>

            <div className="flex flex-col items-end space-y-4">
              <div className="text-sm text-slate-500">{j.status === 'Active' ? 'Active' : 'Inactive'}</div>
              <div>
                <button onClick={() => toggle(j.id)} className="px-3 py-1 border rounded">Deactivate</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
