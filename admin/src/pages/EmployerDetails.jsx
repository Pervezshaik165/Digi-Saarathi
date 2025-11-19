import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";

const EmployerDetails = () => {
  const { id } = useParams();
  const { api } = useContext(AdminContext);
  const [employer, setEmployer] = useState(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const { data } = await api.get(`/api/admin/employers/${id}`);
        setEmployer(data.employer);
      } catch (e) {
        setEmployer({ _id: id, name: "Demo Employer", company: "Demo Co", status: "Pending", docs: [] });
      }
    };
    fetcher();
  }, [api, id]);

  if (!employer) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Employer Details</h2>

      <div className="bg-white p-4 rounded shadow">
        <p><strong>Name:</strong> {employer.name}</p>
        <p><strong>Company:</strong> {employer.company}</p>
        <p><strong>Status:</strong> {employer.status}</p>

        <div className="mt-4">
          <h3 className="font-semibold">Documents</h3>
          {employer.docs && employer.docs.length ? (
            <ul>
              {employer.docs.map((d, idx) => (
                <li key={idx}>{d.name || 'Document'}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No documents available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDetails;
