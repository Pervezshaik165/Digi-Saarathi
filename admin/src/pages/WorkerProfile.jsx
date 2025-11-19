import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";

const WorkerProfile = () => {
  const { id } = useParams();
  const { api } = useContext(AdminContext);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const fetcher = async () => {
      try {
        const { data } = await api.get(`/api/admin/workers/${id}`);
        setWorker(data.worker);
      } catch (e) {
        setWorker({ _id: id, name: "Demo Worker", phone: "00000", skills: ["demo"], verifications: 2 });
      }
    };
    fetcher();
  }, [api, id]);

  if (!worker) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Worker Profile</h2>

      <div className="bg-white p-4 rounded shadow">
        <p><strong>Name:</strong> {worker.name}</p>
        <p><strong>Phone:</strong> {worker.phone}</p>
        <p><strong>Skills:</strong> {(worker.skills || []).join(", ")}</p>
        <p><strong>Verifications:</strong> {worker.verifications}</p>

        <div className="mt-4">
          <button className="px-3 py-1 bg-red-600 text-white rounded">Deactivate</button>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
