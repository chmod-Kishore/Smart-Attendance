import React, { useEffect, useState } from "react";
import "../styles/Nav.css";
import UserDetails from "./UserDetails";
import logout from "../assets/logout.png";

const Nav = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = {
      email: localStorage.getItem("email"),
      name: localStorage.getItem("name"),
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
        {localStorage.getItem("email") && (
          <div className="logout-container">
            <a href="/logout">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-logout"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                <path d="M9 12h12l-3 -3" />
                <path d="M18 15l3 -3" />
              </svg>
            </a>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Nav;
