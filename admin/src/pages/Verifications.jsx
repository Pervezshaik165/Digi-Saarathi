import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";

const Verifications = () => {
  const { api } = useContext(AdminContext);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const f = async () => {
      try {
        const { data } = await api.get("/api/admin/logs");
        setLogs(data.logs || []);
      } catch (e) {
        setLogs([]);
      }
    };
    f();
  }, [api]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Action Logs</h2>

      <div className="bg-slate-50 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Recent Actions</h3>

        <div className="space-y-4">
          {logs.map(l => (
            <div key={l.id} className="bg-white rounded-md p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{l.action.toUpperCase()} — {l.entityType}</div>
                  <div className="text-sm text-slate-500 mt-1">{l.details && Object.keys(l.details).length ? JSON.stringify(l.details) : ''}</div>
                </div>
                <div className="text-sm text-slate-400">{new Date(l.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-500">No logs yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verifications;
