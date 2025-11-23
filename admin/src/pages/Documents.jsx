import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";

const samplePending = [];

const Documents = () => {
  const { api } = useContext(AdminContext);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('Pending');

  useEffect(() => {
    const f = async () => {
      try {
        const { data } = await api.get("/api/admin/documents");
        setPending(data.documents || []);
      } catch (e) {
        setPending(samplePending);
      }
    };
    f();
  }, [api]);

  const verify = async (id) => {
    try {
      await api.put(`/api/admin/documents/${id}/status`, { status: 'verified' });
      setPending((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Verified' } : p)));
      toast.success('Document verified');
    } catch (err) {
      // error handled by interceptor
    }
  };

  const reject = async (id) => {
    try {
      await api.put(`/api/admin/documents/${id}/status`, { status: 'rejected' });
      setPending((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)));
      toast.warn('Document rejected');
    } catch (err) {
      // handled by interceptor
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Document Verification</h2>

        <div className="space-x-3">
          {['Pending','All','Verified','Rejected'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-sm ${tab===t? 'bg-slate-800 text-white':'text-slate-700'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {pending.map(d => (
          (tab === 'All' || (tab === 'Pending' && d.status === 'Pending') || (tab === 'Verified' && d.status === 'Verified') || (tab === 'Rejected' && d.status === 'Rejected')) && (
            <div key={d.id} className="bg-slate-50 rounded-xl p-6 shadow-sm flex items-start justify-between">
              <div>
                <div className="font-semibold">{d.type}</div>
                <div className="text-sm text-slate-600">{d.owner} {d.ownerEmail && <span className="text-xs text-slate-400">({d.ownerEmail})</span>}</div>
                <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-500 text-sm underline mt-2 inline-block">View Document</a>
                <div className="text-xs text-slate-500 mt-3">Uploaded<br/>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : ''}</div>
              </div>

              <div className="flex items-center space-x-3">
                {d.status === 'Pending' && (
                  <>
                    <span className="text-sm text-slate-500">Pending</span>
                    <button onClick={() => verify(d.id)} className="px-3 py-1 bg-emerald-500 text-white rounded">Verify</button>
                    <button onClick={() => reject(d.id)} className="px-3 py-1 border border-rose-400 text-rose-600 rounded">Reject</button>
                  </>
                )}

                {d.status === 'Verified' && <span className="text-sm text-slate-500">Verified</span>}
                {d.status === 'Rejected' && <span className="text-sm text-rose-600">Rejected</span>}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Documents;
