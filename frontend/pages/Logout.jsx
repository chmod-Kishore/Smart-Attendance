import React, { useEffect } from "react";
import "../styles/Logout.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();

    setTimeout(() => {
      navigate("/");
    }, 3000);
  }, []);

  return (
    <div className="logout-main">
      <div className="logout-container">
        <div className="logout-card">
          <div className="logout-header">
            <h2>Logout Successful!</h2>
            <p>You have been safely logged out of your account</p>
          </div>
          
          <div className="logout-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#4d5ef6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            </svg>
          </div>
          
          <div className="countdown-container">
            <div className="countdown-bar"></div>
          </div>
          
          <p className="redirect-message">
            You will be redirected to the login page in a few seconds...
          </p>
          
          <div className="logout-footer">
            <Link to="/" className="login-again-link">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;