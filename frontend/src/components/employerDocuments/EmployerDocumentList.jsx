import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const EmployerDocumentList = () => {
  const { api, employerToken, refreshDocs } = useContext(AppContext);
  const { t } = useTranslation();

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
      toast.error(t('documents.errors.fetchFailed', 'Failed to fetch documents'));
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
          toast.success(t('documents.success.deleted', 'Document deleted'));
        setDocs((prev) => prev.filter((doc) => doc._id !== id));
      }
    } catch (error) {
      toast.error(t('documents.errors.deleteFailed', 'Delete failed'));
    }
  };

  return (
    <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">{t('employer.documents.title', 'Company Documents')}</h2>

      {loading && <p className="text-gray-500">{t('common.loading', 'Loading...')}</p>}

      {!loading && docs.length === 0 && (
        <p className="text-gray-500">{t('documents.noUploaded', 'No documents uploaded yet.')}</p>
      )}

      <div className="space-y-4">
        {docs.map((doc) => (
          <div key={doc._id} className="border p-3 rounded-md flex items-center justify-between">
            <div>
              <p className="font-medium capitalize">{doc.type}</p>
              <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-500 text-sm underline">
                {t('documents.view', 'View Document')}
              </a>

              {doc.status === "rejected" && (
                <div className="text-rose-600 text-sm mt-2">{t('documents.status.rejected')}</div>
              )}

              {doc.status === "verified" && (
                <div className="text-emerald-600 text-sm mt-2">{t('documents.status.verified')}</div>
              )}

              {doc.status === "pending" && (
                <div className="text-slate-500 text-sm mt-2">{t('documents.status.pending')}</div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => deleteDoc(doc._id)} className="text-red-500 font-semibold">{t('documents.delete', 'Delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployerDocumentList;
