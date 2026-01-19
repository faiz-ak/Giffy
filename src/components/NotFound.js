import React from "react";
import { useNavigate } from "react-router-dom";
import "../NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-root">
      <div className="notfound-card">

        <div className="notfound-illustration">
          <img
            src="https://storyset.com/illustration/page-not-found/amico.svg"
            alt="404 Not Found"
          />
        </div>

        <h1>404</h1>
        <h2>Page Not Found</h2>

        <p>
          Oops! The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="notfound-actions">
          <button onClick={() => navigate("/")}>
            🏠 Go to Home
          </button>

          <button
            className="secondary"
            onClick={() => navigate(-1)}
          >
            ← Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
