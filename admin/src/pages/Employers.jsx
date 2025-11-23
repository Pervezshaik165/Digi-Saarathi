import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";

const Employers = () => {
  const { api } = useContext(AdminContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmployer, setNewEmployer] = useState({ company: "", name: "", email: "", password: "", phone: "", location: "" });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/admin/employers");
        if (mounted && data?.employers) setList(data.employers);
      } catch (err) {
        console.error(err);
        setError("Failed to load employers");
        toast.error("Failed to load employers");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, [api]);

  const fetchEmployers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/admin/employers");
      setList(data.employers || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load employers");
      toast.error("Failed to load employers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const openView = async (id) => {
    try {
      const { data } = await api.get(`/api/admin/employers/${id}`);
      setSelected(data.employer);
      setShowView(true);
    } catch (err) {
      console.error(err);
    }
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/admin/employers`, newEmployer);
      setShowAdd(false);
      setNewEmployer({ company: "", name: "", email: "", password: "", phone: "", location: "" });
      fetchEmployers();
      toast.success('Employer created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create employer');
    }
  };

  const formatDate = (iso) => {
    try {
      if (!iso) return "-";
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  };

  const changeEmployerActive = async (id, activate = true) => {
    try {
      const url = `/api/admin/employers/${id}/${activate ? 'activate' : 'deactivate'}`;
      await api.put(url);
      toast.success(`Employer ${activate ? 'activated' : 'deactivated'}`);
      // refresh list
      const { data } = await api.get('/api/admin/employers');
      setList(data.employers || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update employer status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Employer Management</h2>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={() => setShowAdd(true)}>Add Employer</button>
        </div>
      </div>

      {loading && <div className="text-sm text-slate-500">Loading employers...</div>}
      {error && <div className="text-sm text-rose-600 mb-4">{error}</div>}

      <div className="space-y-6">
        {list.length === 0 && !loading && <div className="text-sm text-slate-500">No employers found.</div>}

        {list.map((e) => (
          <div key={e._id} className="bg-slate-50 rounded-xl p-6 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">{e.company || e.name || "(Unnamed)"}</div>
              <div className="text-sm text-slate-600">{e.email || "-"}</div>
              <div className="text-sm text-slate-500 mt-3">{e.phone ? `${e.phone}` : "Phone not provided"}</div>
              {e.location && <div className="text-sm text-slate-500 mt-2">{e.location}</div>}
            </div>

            <div className="text-center">
              <div className="text-sm text-slate-500">Created</div>
              <div className="text-sm">{formatDate(e.createdAt)}</div>
            </div>

            <div className="flex flex-col items-end space-y-4">
              <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">{e.isActive ? 'Active' : 'Deactivated'}</div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-slate-800 text-white rounded" onClick={() => openView(e._id)}>View</button>
                {e.isActive ? (
                  <button onClick={() => changeEmployerActive(e._id, false)} className="px-3 py-1 bg-rose-600 text-white rounded">Deactivate</button>
                ) : (
                  <button onClick={() => changeEmployerActive(e._id, true)} className="px-3 py-1 bg-emerald-600 text-white rounded">Activate</button>
                )}
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
              <h3 className="text-xl font-semibold">Employer Profile</h3>
              <button className="text-slate-500" onClick={() => { setShowView(false); setSelected(null); }}>Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500">Company / Name</div>
                <div className="font-medium">{selected.company || selected.name}</div>

                <div className="text-sm text-slate-500 mt-3">Email</div>
                <div className="font-medium">{selected.email}</div>

                <div className="text-sm text-slate-500 mt-3">Phone</div>
                <div className="font-medium">{selected.phone || '-'}</div>

                <div className="text-sm text-slate-500 mt-3">Location</div>
                <div className="font-medium">{selected.location || '-'}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Account Status</div>
                <div className="font-medium">{selected.isActive ? 'active' : 'deactivated'}</div>

                <div className="text-sm text-slate-500 mt-3">Created</div>
                <div className="font-medium">{formatDate(selected.createdAt)}</div>

                <div className="text-sm text-slate-500 mt-3">Additional Info</div>
                <div className="font-medium">{selected.notes || '-'}</div>
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
              <h3 className="text-xl font-semibold">Add Employer</h3>
              <button className="text-slate-500" onClick={() => setShowAdd(false)}>Close</button>
            </div>

            <form onSubmit={submitAdd} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600">Company</label>
                <input required value={newEmployer.company} onChange={(e) => setNewEmployer({ ...newEmployer, company: e.target.value })} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Contact Name</label>
                <input value={newEmployer.name} onChange={(e) => setNewEmployer({ ...newEmployer, name: e.target.value })} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Email</label>
                <input required type="email" value={newEmployer.email} onChange={(e) => setNewEmployer({ ...newEmployer, email: e.target.value })} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Password</label>
                <input required type="password" value={newEmployer.password} onChange={(e) => setNewEmployer({ ...newEmployer, password: e.target.value })} className="w-full border px-3 py-2 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600">Phone</label>
                  <input value={newEmployer.phone} onChange={(e) => setNewEmployer({ ...newEmployer, phone: e.target.value })} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Location</label>
                  <input value={newEmployer.location} onChange={(e) => setNewEmployer({ ...newEmployer, location: e.target.value })} className="w-full border px-3 py-2 rounded" />
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

export default Employers;
