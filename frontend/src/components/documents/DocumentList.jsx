import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';

const DocumentList = () => {
  const { api, userToken, refreshDocs } = useContext(AppContext); 
  const { t } = useTranslation();
  // ⬆ refreshDocs is a trigger from context and will fire when upload happens

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/user/documents", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (data.success) {
        setDocs(data.documents);
      }
    } catch (error) {
      toast.error(t('documents.errors.fetchFailed'));
    }
    setLoading(false);
  };

  // Load when page opens + when refreshDocs changes  
  useEffect(() => {
    fetchDocs();
  }, [refreshDocs]);  // ⭐ Reactively reloads after upload

  const deleteDoc = async (id) => {
    try {
      const { data } = await api.delete(`/api/user/documents/${id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (data.success) {
        toast.success(t('documents.success.deleted'));

        // ⬇ instantly update UI without refreshing page
        setDocs((prev) => prev.filter((doc) => doc._id !== id));
      }
    } catch (error) {
      toast.error(t('documents.errors.deleteFailed'));
    }
  };

  return (
    <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-semibold mb-4">{t('documents.title')}</h2>

      {loading && <p className="text-gray-500">{t('documents.loading')}</p>}

      {!loading && docs.length === 0 && (
        <p className="text-gray-500">{t('documents.noUploaded')}</p>
      )}

      <div className="space-y-4">
        {docs.map((doc) => (
          <div
            key={doc._id}
            className="border p-3 rounded-md flex items-center justify-between"
          >
            <div>
              <p className="font-medium capitalize">{doc.type}</p>

              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 text-sm underline"
              >
                {t('documents.view')}
              </a>

              {doc.status === 'rejected' && (
                  <div className="text-rose-600 text-sm mt-2">
                  {t('documents.status.rejected')}
                </div>
              )}

              {doc.status === 'verified' && (
                <div className="text-emerald-600 text-sm mt-2">
                  {t('documents.status.verified')}
                </div>
              )}
              {doc.status === 'pending' && (
                  <div className="text-slate-500 text-sm mt-2">
                  {t('documents.status.pending')}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => deleteDoc(doc._id)}
                className="text-red-500 font-semibold"
              >
                {t('documents.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default DocumentList;
