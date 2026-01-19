import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../Navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isRainbow = pathname === "/rainbow";
  const isGiffy = pathname === "/giffy";

  return (
    <nav className="nav-root">
      {/* LOGO / HOME */}
      <div className="nav-logo" onClick={() => navigate("/")}>
        🌈 GiffyText
      </div>

      {/* TOGGLE (HIDDEN ON 404) */}
      {(isRainbow || isGiffy) && (
        <div className="nav-toggle">
          <NavLink
            to="/rainbow"
            className={`nav-tab ${isRainbow ? "active" : ""}`}
          >
            Rainbow
          </NavLink>

          <NavLink
            to="/giffy"
            className={`nav-tab ${isGiffy ? "active" : ""}`}
          >
            GIF
          </NavLink>

          <div className={`nav-indicator ${isGiffy ? "right" : ""}`} />
        </div>
      )}
    </nav>
  );
}
