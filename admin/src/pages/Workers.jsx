import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";

const accountBadge = (worker) => {
  if (!worker.isActive) return <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">DEACTIVATED</span>;
  return <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-600 text-white">ACTIVE</span>;
};

const Workers = () => {
  const { api } = useContext(AdminContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", phone: "", address: "" });

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/workers");
      setList(data.workers || []);
    } catch (e) {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const openView = async (id) => {
    try {
      const { data } = await api.get(`/api/admin/workers/${id}`);
      setSelected(data.worker);
      setShowView(true);
    } catch (e) {
      // ignore
    }
  };

  const doActivate = async (id) => {
    await api.put(`/api/admin/workers/${id}/activate`);
    fetchWorkers();
  };

  const doDeactivate = async (id) => {
    await api.put(`/api/admin/workers/${id}/deactivate`);
    fetchWorkers();
  };

  const doDelete = async (id) => {
    if (!window.confirm("Delete this worker permanently?")) return;
    await api.delete(`/api/admin/workers/${id}`);
    fetchWorkers();
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/admin/workers`, newUser);
      setShowAdd(false);
      setNewUser({ name: "", email: "", password: "", phone: "", address: "" });
      fetchWorkers();
    } catch (e) {
      // handled by interceptor
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Worker Management</h2>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={() => setShowAdd(true)}>Add Worker</button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-sm text-slate-500">Loading workers…</div>}
        {list.length === 0 && !loading && <div className="text-sm text-slate-500">No workers found.</div>}

        {list.map((w) => (
          <div key={w._id} className="bg-slate-50 rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">{w.name}</div>
              <div className="text-sm text-slate-600">{(w.skills || []).join(", ")}</div>
              <div className="text-sm text-slate-500 mt-3">Phone<br/>{w.phone}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-slate-500">Joined</div>
              <div className="text-sm">{new Date(w.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-slate-500">Account Status</div>
              <div className="text-sm mt-1">{accountBadge(w)}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-slate-500">Documents</div>
              <div className="text-sm mt-1">{(w.documentVerificationStatus || 'pending').toUpperCase()}</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-slate-500">Skill Certificate</div>
              <div className="text-sm mt-1">{w.skillCertificatePresent ? 'Present' : 'Not present'}</div>
            </div>

            <div className="flex flex-col items-end space-y-4">
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-slate-800 text-white rounded" onClick={() => openView(w._id)}>View</button>
                {w.isActive ? (
                  <button className="px-3 py-1 border rounded" onClick={() => doDeactivate(w._id)}>Deactivate</button>
                ) : (
                  <button
                    className={`px-3 py-1 bg-emerald-500 text-white rounded`}
                    onClick={() => doActivate(w._id)}
                  >Activate</button>
                )}
                <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => doDelete(w._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {showView && selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-2/3 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Worker Profile</h3>
              <button className="text-slate-500" onClick={() => { setShowView(false); setSelected(null); }}>Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500">Name</div>
                <div className="font-medium">{selected.name}</div>

                <div className="text-sm text-slate-500 mt-3">Email</div>
                <div className="font-medium">{selected.email}</div>

                <div className="text-sm text-slate-500 mt-3">Phone</div>
                <div className="font-medium">{selected.phone || '-'}</div>

                <div className="text-sm text-slate-500 mt-3">Address</div>
                <div className="font-medium">{selected.address || '-'}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Skills</div>
                <div className="font-medium">{(selected.skills || []).join(', ') || '-'}</div>

                <div className="text-sm text-slate-500 mt-3">Account Status</div>
                <div className="font-medium">{selected.isActive ? 'active' : 'deactivated'}</div>

                <div className="text-sm text-slate-500 mt-3">Documents</div>
                <div className="font-medium">{(selected.documentVerificationStatus || 'pending')}</div>

                <div className="text-sm text-slate-500 mt-3">Skill Certificate</div>
                <div className="font-medium">{selected.skillCertificatePresent ? 'Present' : 'Not present'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Worker</h3>
              <button className="text-slate-500" onClick={() => setShowAdd(false)}>Close</button>
            </div>

            <form onSubmit={submitAdd} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Name</label>
                <input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Email</label>
                <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Password</label>
                <input required type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full border px-3 py-2 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600">Phone</label>
                  <input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Address</label>
                  <input value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} className="w-full border px-3 py-2 rounded" />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
