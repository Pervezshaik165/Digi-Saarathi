import React from "react";
import Navbar from "../components/Navbar";

const UserLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="mt-4 px-4">{children}</div>
    </>
  );
};

export default UserLayout;
