import React, { useEffect } from "react";
import "../styles/Logout.css";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();

    setTimeout(() => {
      navigate("/");
    }, 1000);
  }, []);

  return (
    <div className="logout-main">
      <h1>Logout Successfull!</h1>
      <p>You will be redirected to the landing page in 1 second...</p>
    </div>
  );
};

export default Logout;
