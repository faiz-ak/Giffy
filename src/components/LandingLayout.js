import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../Landing.css";

export default function LandingLayout() {
  const { pathname } = useLocation();
  const isGiffy = pathname === "/giffy";

  return (
    <div className="landing-root">
      <section className="landing-hero">

        {/* LEFT CONTENT */}
        <div className="hero-left">
          <h1>
            Create <span>Rainbow Text</span> &{" "}
            <span>Animated GIFs</span>
          </h1>

          <p>
            A creative studio to design beautiful rainbow typography and
            personalized reaction GIFs — fast, fun, and easy.
          </p>

          {/* 🔀 TOGGLE */}
          <div className="landing-toggle">
           
            <NavLink to="/giffy" className="landing-tab">
              🎬 GIF Generator
            </NavLink>
 <NavLink to="/rainbow" className="landing-tab">
              🌈 Rainbow Text
            </NavLink>

            <div
              className={`landing-indicator ${isGiffy ? "left" : ""}`}
            />
          </div>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="hero-right">
          <img
            src="../landing.gif"
            alt="Creative illustration"
          />
        </div>

      </section>
    </div>
  );
}
