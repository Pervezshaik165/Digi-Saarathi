import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";

const sample = [
  { id: "v1", worker: "Worker One", employer: "Alice Co", role: "Plumber", rating: 4, date: "2025-02-10" },
  { id: "v2", worker: "Worker Two", employer: "Bob Ltd", role: "Carpenter", rating: 5, date: "2025-02-11" },
];

const Verifications = () => {
  const { api } = useContext(AdminContext);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const f = async () => {
      try {
        const { data } = await api.get("/api/admin/verifications");
        setLogs(data.logs || []);
      } catch (e) {
        setLogs(sample);
      }
    };
    f();
  }, [api]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Work Verification Logs</h2>

      <div className="bg-slate-50 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Recent Verifications</h3>

        <div className="space-y-4">
          {logs.map(l => (
            <div key={l.id} className="bg-white rounded-md p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{l.worker} — {l.role}</div>
                <div className="text-sm text-slate-500">{l.employer}</div>
              </div>
              <div className="text-sm text-slate-400">{l.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Verifications;
