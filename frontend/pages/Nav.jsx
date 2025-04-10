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
    <div className={`nav-container ${isLoggedIn ? "nav-logged-in" : ""}`}>
      <nav className="nav-bar">
        <div className="nav-logo-container">
          <a href="/">
            <div className="nav-logo">
              <img
                src="/logo6.png"
                alt="ScanMe Logo"
                className="nav-logo-img"
              />
            </div>
          </a>
        </div>

        {isLoggedIn && userDetails && (
          <div className="nav-icons-container">
            <div className="nav-profile-container">
              <div
                className="nav-icon-wrapper nav-user-icon"
                onClick={toggleMenu}
              >
                <Person4Icon className="nav-person-icon" />
              </div>

              {showMenu && (
                <div className="nav-dropdown-menu" ref={menuRef}>
                  <p className="nav-user-name">{userDetails.name}</p>
                  <p className="nav-user-email">{userDetails.email}</p>
                  <p className="nav-user-dob">
                    DOB: {userDetails.dob || "N/A"}
                  </p>
                </div>
              )}
            </div>

            <div
              className="nav-logout-container"
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
