import React from "react";
import { Link, Navigate } from "react-router-dom";
import { FaDownload, FaArrowRight, FaImage, FaStar } from "react-icons/fa";
import { useAssessment } from "../context/AssessmentContext";

const downloadPdfFromBase64 = (base64, filename = "PCOSmart_Report.pdf") => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};

const CombinedResult = () => {
  const { mlResult } = useAssessment();

  if (!mlResult) return <Navigate to="/check/combined" replace />;

  // your backend should set inputMode:"combined" for fusion endpoint
  // if you use a different name, adjust this guard or remove it
  if (mlResult.inputMode !== "combined") return <Navigate to="/check/combined" replace />;

  const probability = mlResult?.mlResult?.probability ?? 0;
  const probabilityPercent = Math.round(probability * 100);
  const riskLevel = mlResult?.mlResult?.risk_level || "Unknown";
  const narration = mlResult?.mlResult?.narration || "";

  const riskBadge =
    riskLevel === "Low"
      ? "risk-low"
      : riskLevel === "High"
        ? "risk-high"
        : "risk-moderate";

  const imageUrl = mlResult?.imageUrl || "";

  const handleDownload = () => {
    const report = mlResult?.report;
    if (!report?.base64) {
      alert("Report not available. Ensure backend returns report.base64 in the prediction response.");
      return;
    }
    downloadPdfFromBase64(report.base64, report.filename || `PCOSmart_combined_${mlResult.submissionId}.pdf`);
  };

  return (
    <div className="container page-spacing" style={{ maxWidth: "1100px" }}>
      <div className="text-center mb-10">
        <span className="badge">Analysis Complete</span>
        <h1 style={{ fontSize: "2.5rem", marginTop: "10px" }}>
          Your Complete <span style={{ color: "#D6689C" }}>Results</span>
        </h1>
      </div>

      {/* Score Grid */}
      <div className="result-grid-3">
        <div className="card" style={{ textAlign: "center" }}>
          <FaImage size={30} style={{ color: "#D6689C", marginBottom: "15px" }} />
          <h4 style={{ color: "#718096" }}>Combined Model</h4>
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#D6689C" }}>
            {probabilityPercent}%
          </div>
        </div>

        <div
          className="card"
          style={{
            textAlign: "center",
            background: "linear-gradient(135deg, #D6689C 0%, #B370B0 100%)",
            color: "white",
          }}
        >
          <FaStar size={30} style={{ marginBottom: "15px", opacity: 0.8 }} />
          <h4 style={{ color: "rgba(255,255,255,0.8)" }}>Final Probability</h4>
          <div style={{ fontSize: "3rem", fontWeight: "bold" }}>{probabilityPercent}%</div>
          <span
            className={`risk-badge ${riskBadge}`}
            style={{
              background: "white",
              color: "#D6689C",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "0.8rem",
              fontWeight: "bold",
              display: "inline-block",
              marginTop: 10,
            }}
          >
            {riskLevel} Risk
          </span>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <h4 style={{ color: "#718096" }}>Submission</h4>
          <div style={{ fontSize: "0.95rem", color: "#4A5568", wordBreak: "break-all" }}>
            {mlResult.submissionId}
          </div>
        </div>
      </div>

      {/* Image preview */}
      {imageUrl && (
        <div className="card mb-8" style={{ marginTop: 18 }}>
          <h3 style={{ marginBottom: 12 }}>Uploaded Image</h3>
          <div style={{ textAlign: "center" }}>
            <img
              src={imageUrl}
              alt="Uploaded ultrasound"
              style={{ maxWidth: "100%", maxHeight: 380, borderRadius: 12 }}
            />
          </div>
        </div>
      )}

      {/* Details */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>Understanding Your Results</h3>
        <p style={{ color: "#4A5568", whiteSpace: "pre-line" }}>{narration}</p>

        <p style={{ color: "#718096", fontSize: "0.85rem", marginTop: 10 }}>
          <strong>Disclaimer:</strong> This AI screening tool is for educational purposes only and
          should not replace professional medical advice.
        </p>
      </div>

      {/* Footer Buttons */}
      <div className="action-buttons-container" style={{ marginTop: 22 }}>
        <button className="btn btn-primary" onClick={handleDownload}>
          <FaDownload /> Download PDF Report
        </button>

        <Link to="/diet" className="btn btn-outline">
          View Full Diet & Exercise Guide <FaArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default CombinedResult;