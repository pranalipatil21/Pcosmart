import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); 
      login(data.user);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo" style={{ textAlign: "center" }}>
            <img
              src="/favicon.png"
              alt="PCOSmart Logo"
              style={{ height: "80px" }}
            />
          </div>

          <h2 style={{ fontSize: "2rem" }}>
            PCOS<span style={{ color: "#D6689C" }}>mart</span>
          </h2>
          <h3>Welcome Back</h3>
          <p>Sign in to access your health dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <div>
            <label>Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon-left" />
              <input
                type="email"
                className="input-with-icon"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label>Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                className="input-with-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="btn-register-full">
            <FaSignInAlt /> Sign In
          </button>

          <p>
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;