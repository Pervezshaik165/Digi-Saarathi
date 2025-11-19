import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";

const samplePending = [
  { id: "d1", type: "ID Card", owner: "Fatima Bano", uploadedAt: "11/18/2025, 10:33:22 PM", status: 'Pending' },
  { id: "d2", type: "Certificate", owner: "Rajesh Kumar", uploadedAt: "11/18/2025, 10:33:22 PM", status: 'Verified' },
];

const Documents = () => {
  const { api } = useContext(AdminContext);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('Pending');

  useEffect(() => {
    const f = async () => {
      try {
        const { data } = await api.get("/api/admin/documents/pending");
        setPending(data.pending || []);
      } catch (e) {
        setPending(samplePending);
      }
    };
    f();
  }, [api]);

  const verify = async (id) => {
    toast.success(`Verify ${id} (would call API and set verifiedBy)`);
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
                <div className="text-sm text-slate-600">{d.owner}</div>
                <div className="text-xs text-slate-500 mt-3">Uploaded<br/>{d.uploadedAt}</div>
              </div>

              <div className="flex items-center space-x-3">
                {d.status === 'Pending' && (
                  <>
                    <span className="text-sm text-slate-500">Pending</span>
                    <button onClick={() => verify(d.id)} className="px-3 py-1 bg-emerald-500 text-white rounded">Verify</button>
                    <button onClick={() => toast.warn('Reject '+d.id)} className="px-3 py-1 border border-rose-400 text-rose-600 rounded">Reject</button>
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
