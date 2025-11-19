import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";

const sample = [
  { _id: "e1", name: "Sunrise Constructions", owner: "Ramesh Singh", contact: "ramesh@sunrise.example · 9876543210", status: "Pending", createdAt: "11/13/2025, 10:33:22 PM" },
  { _id: "e2", name: "Kiran Traders Pvt Ltd", owner: "Kiran Traders", contact: "contact@kiran.example · 9123456780", status: "Approved", createdAt: "10/29/2025, 10:33:22 PM" },
  { _id: "e3", name: "Mohan & Sons Construction", owner: "Mohan & Sons", contact: "mohan@example.com · 9012345678", status: "Rejected", createdAt: "11/15/2025, 10:33:22 PM" },
];

const statusBadge = (status) => {
  const base = "inline-block text-xs font-semibold px-3 py-1 rounded-full";
  if (status === "Pending") return <span className={`${base} bg-amber-100 text-amber-700`}>PENDING</span>;
  if (status === "Approved") return <span className={`${base} bg-slate-800 text-white`}>APPROVED</span>;
  if (status === "Rejected") return <span className={`${base} bg-rose-100 text-rose-600`}>REJECTED</span>;
  return <span className={`${base} bg-slate-100 text-slate-700`}>{status}</span>;
}

const Employers = () => {
  const { api } = useContext(AdminContext);
  const [list, setList] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data } = await api.get("/api/admin/employers");
        if (mounted && data?.employers) setList(data.employers);
      } catch (err) {
        setList(sample);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, [api]);

  const act = async (id, action) => {
    toast.info(`Would ${action} employer ${id} (hook API)`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Employer Management</h2>

      <div className="space-y-6">
        {list.map((e) => (
          <div key={e._id} className="bg-slate-50 rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">{e.name}</div>
              <div className="text-sm text-slate-600">{e.owner}</div>
              <div className="text-sm text-slate-500 mt-3">Contact<br/>{e.contact}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-slate-500">Created</div>
              <div className="text-sm">{e.createdAt}</div>
            </div>

            <div className="flex flex-col items-end space-y-4">
              <div>{statusBadge(e.status)}</div>
              <div className="flex items-center space-x-2">
                <button onClick={() => act(e._id, 'view')} className="px-3 py-1 bg-slate-800 text-white rounded">View</button>
                {e.status === 'Pending' && (
                  <>
                    <button onClick={() => act(e._id, 'approve')} className="px-3 py-1 bg-emerald-500 text-white rounded">Approve</button>
                    <button onClick={() => act(e._id, 'reject')} className="px-3 py-1 border border-rose-400 text-rose-600 rounded">Reject</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employers;
