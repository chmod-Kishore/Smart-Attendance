import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Nav.css";
import Person4Icon from "@mui/icons-material/Person4";
import LogoutIcon from "@mui/icons-material/Logout";

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
            <div className="logo">
              <img src="/logo.png" alt="ScanMe Logo" className="logo-img" />
            </div>
          </a>
          <span className="logo-text">ScanMe</span>
        </div>

        {/* Show Profile & Logout Icons Only If Logged In */}
        {isLoggedIn && userDetails && (
          <div className="icons-container">
            {/* Search Box */}
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search classes..." 
                className="search-input"
              />
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
            </div>

            {/* Profile Icon with Dropdown */}
            <div className="profile-container">
              <div className="icon-wrapper user-icon" onClick={toggleMenu}>
                <Person4Icon className="person" />
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
              <LogoutIcon />
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Nav;