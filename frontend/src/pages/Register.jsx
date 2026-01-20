import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaCalendar, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            age: Number(formData.age),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };





  return (
    <div className="split-screen">
      <div className="register-content-wrapper">

        {/* Left Side: Information */}
        <div className="register-info">
          <span className="pink-badge">Join PCOSmart</span>
          <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '20px' }}>
            Start Your <span style={{ color: '#D6689C' }}>Health Journey</span>
          </h1>
          <p style={{ color: '#718096', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
            Create your free account to access personalized PCOS screening,
            track your health progress, and receive tailored recommendations.
          </p>

          <div className="benefits-list">
            <div className="check-list-item">
              <div className="check-icon-circle"><FaCheck /></div>
              <span>Track your symptoms over time</span>
            </div>
            <div className="check-list-item">
              <div className="check-icon-circle"><FaCheck /></div>
              <span>Save and compare test results</span>
            </div>
            <div className="check-list-item">
              <div className="check-icon-circle"><FaCheck /></div>
              <span>Personalized health recommendations</span>
            </div>
            <div className="check-list-item">
              <div className="check-icon-circle"><FaCheck /></div>
              <span>Access to exclusive resources</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="register-card">
          <div className="form-icon-header">
            <FaUserPlus />
          </div>
          <h2 className="text-center" style={{ marginBottom: '10px' }}>Create Account</h2>
          <p className="text-center" style={{ color: '#718096', marginBottom: '30px', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#D6689C', fontWeight: '600' }}>Sign in</Link>
          </p>
          
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4A5568' }}>Full Name</label>
              <div className="input-wrapper">
                <FaUser className="input-icon-left" />
                <input name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  className="input-with-icon"
                  placeholder="username" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4A5568' }}>Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon-left" />
                <input name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  className="input-with-icon"
                  placeholder="user@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4A5568' }}>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon-left" />
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="input-with-icon"
                  placeholder="Create a strong password"
                />
                <div
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {/* Age */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4A5568' }}>Age</label>
              <div className="input-wrapper">
                <FaCalendar className="input-icon-left" />
                <input
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  type="number"
                  className="input-with-icon"
                  placeholder="Your age" />
              </div>
            </div>

            <button className="btn-register-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#A0AEC0', marginTop: '10px' }}>
              By creating an account, you agree to our <Link to="/terms" style={{ color: '#D6689C' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#D6689C' }}>Privacy Policy</Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Register;