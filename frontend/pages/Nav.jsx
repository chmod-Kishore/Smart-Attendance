import React, { useEffect, useState } from "react";
import "../styles/Nav.css";
import UserDetails from "./UserDetails";
import logo from "../assets/logo192.png";
import logout from "../assets/logout.png";

const Nav = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = {
      email: localStorage.getItem("email"),
      name: localStorage.getItem("name"),
      pno: localStorage.getItem("pno"),
      dob: localStorage.getItem("dob"),
    };
    if (storedUser.email) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
  }, [setUser]);

  return (
    <div className={`nav-container ${user ? "logged-in" : ""}`}>
      <nav>
        {/* Logo and Title */}
        <div className="logo-container">
          <a href="/">
            <img className="logo" src="/logo.webp" alt="QR Scan Logo" />
          </a>
          <span className="logo-text">QR Scan</span>
        </div>

        {/* Show logout only if user is logged in */}
        {user && (
          <div className="logout-container">
            <a href="/logout">
              <img className="logout-icon" src={logout} alt="Logout" />
            </a>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Nav;
