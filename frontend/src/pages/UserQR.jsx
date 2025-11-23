import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserQR = () => {
  const { api, userToken } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const f = async () => {
      if (!userToken) return navigate('/');
      setLoading(true);
      try {
        const res = await api.get('/api/user/verifications', { headers: { Authorization: `Bearer ${userToken}` } });
        if (res.data.success) {
          // Use backend data but compute verification URL using frontend origin (so port is the dev frontend port)
          const items = (res.data.verifications || []).map((v) => ({
            ...v,
            verificationUrl: `${window.location.origin}/verify/${v.qrToken}`,
          }));
          setVerifications(items);
          setSelected(items[0] || null);
        }
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load verifications');
      } finally {
        setLoading(false);
      }
    };
    f();
  }, [api, userToken, navigate]);

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!verifications || verifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold">No certificates found</h2>
            <p className="mt-2 text-gray-600">You don't have any verifications yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Select Certificate</label>
            <select
              className="w-full p-2 border rounded mt-2"
              value={selected?.id || ""}
              onChange={(e) => setSelected(verifications.find(v => v.id === e.target.value))}
            >
              {verifications.map((v) => (
                <option key={v.id} value={v.id}>{v.companyName} — {v.jobRole} ({new Date(v.createdAt).toLocaleDateString()})</option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg mb-4">
                <QRCodeSVG value={selected.verificationUrl} size={256} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Link</label>
                <div className="flex gap-2">
                  <input type="text" value={selected.verificationUrl} readOnly className="flex-1 px-4 py-2 border rounded-lg bg-gray-50" />
                  <button onClick={() => copyLink(selected.verificationUrl)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Copy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserQR;
