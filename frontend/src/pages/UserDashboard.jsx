import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

const UserDashboard = () => {
  const { userName } = useContext(AppContext);
  return (
    <div className="p-5 text-3xl">
      {`Welcome ${userName || "User"} 👤`}
    </div>
  );
};

export default UserDashboard;
