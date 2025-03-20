import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Nav.css";
import Person4Icon from "@mui/icons-material/Person4"; // User Icon
import LogoutIcon from "@mui/icons-material/Logout"; // Logout Icon

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("email"));
  const [userDetails, setUserDetails] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("email"));

    if (localStorage.getItem("email")) {
      setUserDetails({
        name: localStorage.getItem("name"),
        email: localStorage.getItem("email"),
        dob: localStorage.getItem("dob"),
      });
    }
  }, [location.pathname]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className={`nav-container ${isLoggedIn ? "logged-in" : ""}`}>
      <nav>
        {/* Logo and Title */}
        <div className="logo-container">
          <a href="/">
            <img className="logo" src="/logo.webp" alt="QR Scan Logo" />
          </a>
          <span className="logo-text">ScanMe</span>
        </div>

        {/* Show Profile & Logout Icons Only If Logged In */}
        {isLoggedIn && userDetails && (
          <div className="icons-container">
            {/* Profile Icon */}
            <div className="profile-container">
              <div className="icon-wrapper" onClick={toggleMenu}>
                <Person4Icon fontSize="large" className="person" />
              </div>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="dropdown-menu" ref={menuRef}>
                  <p className="user-name">{userDetails.name}</p>
                  <p className="user-email">{userDetails.email}</p>
                  <p className="user-dob">DOB: {userDetails.dob || "N/A"}</p>
                </div>
              )}
            </div>

            {/* Logout Icon */}
            <div
              className="logout-container"
              onClick={() => navigate("/logout")}
            >
              <LogoutIcon fontSize="large" />
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Nav;
