import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";

const Dashboard = () => {
  const { api } = useContext(AdminContext);
  const [summary, setSummary] = useState({});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const f = async () => {
      try {
        const { data } = await api.get("/api/admin/summary");
        setSummary(data.summary || {});
        setRecent(data.recent || []);
      } catch (e) {
        // fallback sample
        setSummary({ totalWorkers: 3, totalEmployers: 3, pendingEmployers: 1, pendingDocs: 1, jobsPosted: 2, verificationsGiven: 2 });
        setRecent([
          { id: 1, text: "Work verification: Rajesh Kumar — Plumber @ Kiran Traders Pvt Ltd", date: "11/18/2025, 8:33:22 PM" },
          { id: 2, text: "Work verification: Fatima Bano — Mason @ Sunrise Constructions", date: "11/17/2025, 10:33:22 PM" },
        ]);
      }
    };
    f();
  }, [api]);

  const statCard = (label, value, highlight) => (
    <div className="p-4 bg-slate-50 rounded-xl shadow-sm">
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-amber-600' : ''}`}>{value}</div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="col-span-1">{statCard('Total Workers', summary.totalWorkers || 0)}</div>
        <div className="col-span-1">{statCard('Total Employers', summary.totalEmployers || 0)}</div>
        <div className="col-span-1">{statCard('Employers Pending', summary.pendingEmployers || 0, true)}</div>
        <div className="col-span-1">{statCard('Documents Pending', summary.pendingDocs || 0, true)}</div>
        <div className="col-span-1">{statCard('Jobs Posted', summary.jobsPosted || 0)}</div>
        <div className="col-span-1">{statCard('Verifications Given', summary.verificationsGiven || 0)}</div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-50 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-3">Recent Activities</h3>
          <ul>
            {recent.map((r) => (
              <li key={r.id} className="text-sm text-slate-700 py-2 border-b last:border-b-0">{r.text} <span className="text-xs text-slate-500 float-right">{r.date}</span></li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-3">Verification Summary</h3>
          <div className="text-sm text-slate-700">
            <div className="mb-4">
              <div className="font-medium">Rajesh Kumar — Plumber</div>
              <div className="text-xs text-slate-500">Kiran Traders Pvt Ltd</div>
              <div className="text-xs text-slate-400 mt-2">11/18/2025, 8:33:22 PM</div>
            </div>

            <div>
              <div className="font-medium">Fatima Bano — Mason</div>
              <div className="text-xs text-slate-500">Sunrise Constructions</div>
              <div className="text-xs text-slate-400 mt-2">11/17/2025, 10:33:22 PM</div>
            </div>
          </div>

          <div className="mt-4">
            <button className="px-3 py-1 bg-white border rounded">View all logs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
