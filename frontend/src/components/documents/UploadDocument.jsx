import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const UploadDocument = () => {
  const { api, userToken, refreshDocs, setRefreshDocs } = useContext(AppContext);

  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [existingTypes, setExistingTypes] = useState([]);

  const documentTypes = [
    "aadhar",
    "pan",
    "voterId",
    "skill",
    "resume",
    "others",
  ];

  // Fetch existing uploaded document types to prevent duplicates
  const fetchExistingDocs = async () => {
    try {
      const { data } = await api.get("/api/user/documents", {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (data.success) {
        const types = data.documents.map((d) => d.type);
        setExistingTypes(types);
      }
    } catch (error) {
      console.log("Error fetching existing docs:", error);
    }
  };

  useEffect(() => {
    fetchExistingDocs();
  }, [refreshDocs]); // update when upload/delete happens

  const uploadToCloudinary = async () => {
    if (!file) return toast.error(t('documents.errors.selectFile'));

    try {
      setUploading(true);

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
      data.append("folder", "digi-saarathi");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD
        }/auto/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const cloud = await res.json();

      if (!cloud.secure_url) {
        toast.error(t('documents.errors.cloudFail'));
        return null;
      }

      return cloud.secure_url;
    } catch (error) {
      toast.error(t('documents.errors.cloudError'));
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error(t('documents.errors.noFile'));
    if (!type) return toast.error(t('documents.errors.selectType'));

    if (existingTypes.includes(type)) {
      return toast.warning(t('documents.warnings.alreadyUploaded', { type }));
    }

    const url = await uploadToCloudinary();
    if (!url) return;

    try {
      const { data } = await api.post(
        "/api/user/documents",
        { fileUrl: url, type },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (data.success) {
        toast.success(t('documents.success.uploaded'));
        setRefreshDocs((prev) => !prev);
        setFile(null);
        setType("");
      }
    } catch (error) {
      toast.error(t('documents.errors.uploadFailed'));
    }

    setUploading(false);
  };

  return (
    <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">{t('documents.uploadTitle')}</h2>

      {/* Dropdown */}
      <label className="text-sm font-medium">{t('documents.selectTypeLabel')}</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full border p-2 rounded mt-1 mb-3"
      >
        <option value="">{t('documents.chooseType')}</option>
        {documentTypes.map((dt) => (
            <option key={dt} value={dt} disabled={existingTypes.includes(dt)}>
              {dt.toUpperCase()} {existingTypes.includes(dt) && ` (${t('documents.uploaded')})`}
            </option>
          ))}
      </select>

      {/* File Input */}
      <input
        type="file"
        className="w-full border p-2 rounded"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {file && (
        <p className="text-sm text-gray-600 mt-1">{t('documents.selected')}: {file.name}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 bg-primary text-white px-5 py-2 rounded-md disabled:opacity-50"
      >
        {uploading ? t('documents.uploading') : t('documents.upload')}
      </button>
    </div>
  );
};

export default UploadDocument;
