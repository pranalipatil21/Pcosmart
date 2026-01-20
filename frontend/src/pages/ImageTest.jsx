import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaInfoCircle, FaImage } from "react-icons/fa";
import axios from "axios";
import { useAssessment } from "../context/AssessmentContext";

const IMAGE_MODEL_URL = "http://localhost:5000/api/model/imageModel";

const ImageTest = () => {
  const navigate = useNavigate();
  const { setMlResult } = useAssessment();

  const [file, setFile] = useState(null);      // real File
  const [preview, setPreview] = useState("");  // preview URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setError("");
    setFile(f);

    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleAnalyze = async () => {
    setError("");

    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("image", file); // IMPORTANT: field name must be "image" (backend expects upload.single("image"))

      const res = await axios.post(IMAGE_MODEL_URL, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          // axios will set correct multipart boundary automatically
        },
        timeout: 30000,
      });

      // Save result in context and go to result page
      setMlResult(res.data);
      navigate("/result/image");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to analyze image";
      setError(msg);

      if (e?.response?.status === 401) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-spacing" style={{ maxWidth: "1000px" }}>
      <div className="text-center mb-10">
        <span className="badge">Image Analysis</span>
        <h1 style={{ fontSize: "2.5rem", marginTop: "10px" }}>
          Ultrasound <span style={{ color: "#D6689C" }}>Image Test</span>
        </h1>
        <p style={{ color: "#718096" }}>
          Upload your ovarian ultrasound image for AI-powered PCOS probability analysis.
        </p>
      </div>

      <div className="card">
        {error && (
          <div
            style={{
              background: "#FFF5F5",
              border: "1px solid #FED7D7",
              color: "#C53030",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <label className="upload-zone">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{ maxHeight: "350px", borderRadius: "12px" }}
            />
          ) : (
            <>
              <FaCloudUploadAlt
                style={{ fontSize: "3.5rem", color: "#D6689C", marginBottom: "20px" }}
              />
              <h3 style={{ fontSize: "1.2rem" }}>Click to upload ultrasound image</h3>
              <p style={{ color: "#A0AEC0", marginTop: "5px" }}>
                Supported: JPG, PNG • Max: 10MB
              </p>
            </>
          )}
          <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
        </label>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={!file || loading}
            style={{ opacity: !file || loading ? 0.6 : 1 }}
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>
      </div>

      <div className="result-grid-3">
        <div className="card" style={{ marginBottom: "0" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <FaInfoCircle style={{ color: "#D6689C" }} /> Instructions
          </h4>
          <ul style={{ color: "#4A5568", fontSize: "0.9rem", lineHeight: "1.8" }}>
            <li>• Use a clear transvaginal ultrasound image.</li>
            <li>• Ensure the ovaries are visible.</li>
            <li>• Avoid blurry or low-light images.</li>
          </ul>
        </div>

        <div className="card" style={{ marginBottom: "0" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <FaImage style={{ color: "#D6689C" }} /> Sample
          </h4>
          <div
            style={{
              background: "#F7FAFC",
              height: "100px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#A0AEC0",
            }}
          >
            Reference Image
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageTest;