import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const EmployerUserDocuments = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { api, employerToken } = useContext(AppContext);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!employerToken) {
      navigate('/');
      return;
    }
    fetchDocs();
  }, [userId, employerToken]);

  const fetchDocs = async () => {
    try {
      const res = await api.get(`/api/employer/user/${userId}/documents`, { headers: { token: employerToken } });
      if (res.data.success) setDocs(res.data.documents || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('common.loading', 'Loading...')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('employer.userDocuments.title', 'User Documents')}</h2>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-600">{t('common.back', 'Back')}</button>
        </div>
        {docs.length === 0 ? (
          <div className="text-gray-500">{t('employer.userDocuments.noFound', 'No documents found for this user.')}</div>
        ) : (
          <div className="space-y-4">
            {docs.map((d) => (
              <div key={d._id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{d.type || 'Document'}</div>
                  <div className="text-sm text-gray-600">{t('documents.statusLabel', 'Status')}: {d.status || 'pending'}</div>
                </div>
                <div className="flex gap-3">
                  <a href={d.url} target="_blank" rel="noreferrer" className="text-indigo-600">{t('view', 'Open')}</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerUserDocuments;
