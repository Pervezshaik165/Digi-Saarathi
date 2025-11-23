import React from "react";
import UploadDocument from "../components/documents/UploadDocument";
import DocumentList from "../components/documents/DocumentList";

const Documents = () => {
  return (
    <div className="min-h-screen mt-6 px-4 flex flex-col md:flex-row gap-6">
      <DocumentList />
      <UploadDocument />
    </div>
  );
};

export default Documents;
