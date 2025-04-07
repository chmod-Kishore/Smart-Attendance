import React from "react";
import { useEffect } from "react";
import "../styles/Landing.css";
import { Link } from "react-router-dom";
import About from "./About";

const Landing = () => {
  const [tutorial, setTutorial] = React.useState(
    localStorage.getItem("tutorial") ? false : true
  );

  useEffect(() => {
    if (localStorage.getItem("token")) {
      window.location.href = "/login";
    }
  });

  function toggleDone() {
    setTutorial(false);
    localStorage.setItem("tutorial", false);
  }

  return (
    <div className="landing-main">
      {tutorial ? (
        <About toggleDone={toggleDone} />
      ) : (
        <div className="landing-container">
          <div className="landing-content">
            <div className="landing-header">
              <h1>AttendX</h1>
              <p className="landing-subtitle">QR-based Attendance System</p>
            </div>
            <div className="landing-buttons">
              <Link to="/login" className="landing-button landing-login-button">
                Login
              </Link>
              <Link
                to="/register"
                className="landing-button landing-register-button"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
