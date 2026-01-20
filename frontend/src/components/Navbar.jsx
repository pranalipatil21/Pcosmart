import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaChevronDown, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoggedIn, logout, user } = useAuth();

  const isActive = (path) => (location.pathname === path ? "nav-link-active" : "");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Link to="/" className="logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/favicon.png" alt="PCOSmart Logo" style={{ height: "50px", width: "auto" }} />
          <span>
            PCOS<span style={{ color: "var(--primary)"}}>mart</span>
          </span>
        </Link>

        <div className="nav-center">
          <div className="nav-links">
            <Link to="/" className={isActive("/")}>Home</Link>
            <Link to="/about" className={isActive("/about")}>About PCOS</Link>

            {isLoggedIn && (
              <div
                className="nav-item-dropdown"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className={`dropdown-btn ${location.pathname.includes("/check") ? "nav-link-active" : ""}`}>
                  Check PCOS <FaChevronDown size={10} />
                </button>

                <div className="dropdown-menu">
                  <Link to="/check/image" className="dropdown-item">
                    <span className="dropdown-title">Image Test</span>
                    <span className="dropdown-desc">AI-powered ultrasound analysis</span>
                  </Link>
                  <Link to="/check/symptom" className="dropdown-item">
                    <span className="dropdown-title">Symptom Test</span>
                    <span className="dropdown-desc">Symptom-based screening</span>
                  </Link>
                  <Link to="/check/combined" className="dropdown-item">
                    <span className="dropdown-title">Combined Test</span>
                    <span className="dropdown-desc">Most accurate results</span>
                  </Link>
                </div>
              </div>
            )}

            <Link to="/diet" className={isActive("/diet")}>Diet & Exercise</Link>
            <Link to="/awareness" className={isActive("/awareness")}>Awareness</Link>
            <Link to="/contact" className={isActive("/contact")}>Contact</Link>
          </div>
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* ✅ show actual name */}
              <span style={{ fontWeight: "600", color: "#D6689C" }}>
                Hi, {user?.name || "User"}
              </span>

              <button
                onClick={handleLogout}
                className="btn-outline"
                style={{ padding: "8px 20px", fontSize: "0.9rem" }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: "600", color: "#4A5568" }}>
                Login
              </Link>
              <Link to="/register" className="btn-register-nav">
                <FaUser size={14} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;