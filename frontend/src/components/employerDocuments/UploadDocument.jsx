import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const UploadDocument = () => {
  const { api, employerToken, refreshDocs, setRefreshDocs } = useContext(AppContext);

  const [file, setFile] = useState(null);
  const [type, setType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [existingTypes, setExistingTypes] = useState([]);

  const documentTypes = [
    "Company Registration Certificate",
    "Certificate of Incorporation",
    "Business PAN Card",
    "GST Certificate",
    "Founder’s Aadhaar and PAN",
    "Office address proof",
    "others",
  ];

  const fetchExistingDocs = async () => {
    try {
      const { data } = await api.get("/api/employer/documents", {
        headers: { token: employerToken },
      });

      if (data.success) {
        const types = data.documents.map((d) => d.type);
        setExistingTypes(types);
      }
    } catch (error) {
      console.log("Error fetching existing employer docs:", error);
    }
  };

  useEffect(() => {
    fetchExistingDocs();
  }, [refreshDocs]);

  const uploadToCloudinary = async () => {
    if (!file) return toast.error("Please select a file");

    try {
      setUploading(true);

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
      data.append("folder", "digi-saarathi/employer");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD}/auto/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const cloud = await res.json();

      if (!cloud.secure_url) {
        toast.error("Cloudinary upload failed");
        return null;
      }

      return cloud.secure_url;
    } catch (error) {
      toast.error("Cloud upload error");
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("No file selected");
    if (!type) return toast.error("Please select document type");

    if (existingTypes.includes(type)) {
      return toast.warning(`You already uploaded a ${type} document.`);
    }

    const url = await uploadToCloudinary();
    if (!url) return;

    try {
      const { data } = await api.post(
        "/api/employer/documents",
        { fileUrl: url, type },
        { headers: { token: employerToken } }
      );

      if (data.success) {
        toast.success("Document uploaded!");
        setRefreshDocs((prev) => !prev);
        setFile(null);
        setType("");
      }
    } catch (error) {
      toast.error("Upload failed");
    }

    setUploading(false);
  };

  return (
    <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Company Document</h2>

      <label className="text-sm font-medium">Select Document Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full border p-2 rounded mt-1 mb-3"
      >
        <option value="">Choose type...</option>
        {documentTypes.map((t) => (
          <option key={t} value={t} disabled={existingTypes.includes(t)}>
            {t} {existingTypes.includes(t) && " (Uploaded)"}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept="application/pdf,image/*"
        className="w-full border p-2 rounded"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {file && (
        <p className="text-sm text-gray-600 mt-1">Selected: {file.name}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 bg-primary text-white px-5 py-2 rounded-md disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default UploadDocument;
