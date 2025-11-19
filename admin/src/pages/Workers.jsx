import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";

const sample = [
  { _id: "w1", name: "Fatima Bano", phone: "9000000001", skills: ["Masonry"], verifications: 2, docsVerified: 1, status: 'Active' },
  { _id: "w2", name: "Rajesh Kumar", phone: "9000000002", skills: ["Plumbing"], verifications: 5, docsVerified: 3, status: 'Active' },
  { _id: "w3", name: "Sita Devi", phone: "9000000003", skills: ["Carpentry"], verifications: 1, docsVerified: 0, status: 'Deactivated' },
];

const badge = (s) => s === 'Active' ? <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-white">ACTIVE</span> : <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">DEACTIVATED</span>;

const Workers = () => {
  const { api } = useContext(AdminContext);
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const { data } = await api.get("/api/admin/workers");
        setList(data.workers || []);
      } catch (e) {
        setList(sample);
      }
    };
    fetcher();
  }, [api]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Worker Management</h2>

      <div className="space-y-6">
        {list.map((w) => (
          <div key={w._id} className="bg-slate-50 rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">{w.name}</div>
              <div className="text-sm text-slate-600">{(w.skills || []).join(', ')}</div>
              <div className="text-sm text-slate-500 mt-3">Phone<br/>{w.phone}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-slate-500">Verifications</div>
              <div className="text-sm">{w.verifications}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-slate-500">Documents Verified</div>
              <div className="text-sm">{w.docsVerified}</div>
            </div>

            <div className="flex flex-col items-end space-y-4">
              <div>{badge(w.status)}</div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-slate-800 text-white rounded">View</button>
                {w.status === 'Active' ? (
                  <button className="px-3 py-1 border rounded">Deactivate</button>
                ) : (
                  <button className="px-3 py-1 bg-emerald-500 text-white rounded">Activate</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workers;
