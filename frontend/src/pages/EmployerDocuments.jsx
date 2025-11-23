import React from "react";
import { useNavigate } from "react-router-dom";
import UploadDocument from "../components/employerDocuments/UploadDocument";
import DocumentList from "../components/employerDocuments/EmployerDocumentList";
import EmployerHeader from "../components/employer/EmployerHeader";

const EmployerDocuments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerHeader title="Company Documents" />

      <div className="min-h-screen mt-6 px-4 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
        <DocumentList />
        <UploadDocument />
      </div>
    </div>
  );
};

export default EmployerDocuments;
