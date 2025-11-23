import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const EmployerDocumentList = () => {
  const { api, employerToken, refreshDocs } = useContext(AppContext);

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/employer/documents", {
        headers: { token: employerToken },
      });

      if (data.success) setDocs(data.documents);
    } catch (error) {
      toast.error("Failed to fetch documents");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [refreshDocs]);

  const deleteDoc = async (id) => {
    try {
      const { data } = await api.delete(`/api/employer/documents/${id}`, {
        headers: { token: employerToken },
      });

      if (data.success) {
        toast.success("Document deleted");
        setDocs((prev) => prev.filter((doc) => doc._id !== id));
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Company Documents</h2>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && docs.length === 0 && (
        <p className="text-gray-500">No documents uploaded yet.</p>
      )}

      <div className="space-y-4">
        {docs.map((doc) => (
          <div key={doc._id} className="border p-3 rounded-md flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">{doc.type}</p>
              <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 text-sm underline">
                View Document
              </a>

              {doc.status === "rejected" && (
                <div className="text-rose-600 text-sm mt-2">Rejected by admin — please reupload the correct document.</div>
              )}

              {doc.status === "verified" && (
                <div className="text-emerald-600 text-sm mt-2">Verified/Approved by admin.</div>
              )}

              {doc.status === "pending" && (
                <div className="text-slate-500 text-sm mt-2">Pending verification by admin.</div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => deleteDoc(doc._id)} className="text-red-500 font-semibold">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployerDocumentList;
