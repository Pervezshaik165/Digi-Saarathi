import React from "react";
import { useNavigate } from "react-router-dom";
import UploadDocument from "../components/employerDocuments/UploadDocument";
import DocumentList from "../components/employerDocuments/EmployerDocumentList";
import EmployerHeader from "../components/employer/EmployerHeader";
import { useTranslation } from 'react-i18next';

const EmployerDocuments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerHeader title={t('employer.documents.title', 'Company Documents')} />

      <div className="min-h-screen mt-6 px-4 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
        <DocumentList />
        <UploadDocument />
      </div>
    </div>
  );
};

export default EmployerDocuments;
