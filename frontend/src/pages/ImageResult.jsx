import React from "react";
import { Link, Navigate } from "react-router-dom";
import { FaDownload, FaArrowRight, FaEye } from "react-icons/fa";
import { useAssessment } from "../context/AssessmentContext";

const downloadPdfFromBase64 = (base64, filename = "PCOSmart_Report.pdf") => {
  // safer than using data: URL for large PDFs
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

const ImageResult = () => {
  const { mlResult } = useAssessment();

  // Guard if user refreshes or lands directly
  if (!mlResult) return <Navigate to="/check/image" replace />;

  // Optional guard: ensure this page is only used for image mode
  if (mlResult.inputMode !== "image") return <Navigate to="/check/image" replace />;

  const probability = mlResult?.mlResult?.probability ?? 0;
  const probabilityPercent = Math.round(probability * 100);

  const riskLevel = mlResult?.mlResult?.risk_level || "Unknown";
  const narration = mlResult?.mlResult?.narration || "";
  const imageUrl = mlResult?.imageUrl || "";

  const riskClass =
    riskLevel === "Low" ? "risk-low" : riskLevel === "High" ? "risk-high" : "risk-moderate";

  const handleDownloadReport = () => {
    const report = mlResult?.report;
    if (!report?.base64) {
      alert("Report not available in response. Ensure backend is returning report.base64.");
      return;
    }
    downloadPdfFromBase64(report.base64, report.filename || `PCOSmart_image_${mlResult.submissionId}.pdf`);
  };

  return (
    <div className="container page-spacing" style={{ maxWidth: "1000px" }}>
      <div className="text-center mb-10">
        <span className="badge">Analysis Complete</span>
        <h1 style={{ fontSize: "2.5rem", marginTop: "10px" }}>
          Image <span style={{ color: "#D6689C" }}>Results</span>
        </h1>
      </div>

      {/* Main Result Card */}
      <div className="card mb-8">
        <div className="flex" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "40px" }}>
          {/* Circle Graph */}
          <div style={{ flex: 1, minWidth: "250px", textAlign: "center" }}>
            <h4 style={{ color: "#718096", marginBottom: "20px" }}>PCOS Probability</h4>
            <div className="circle-progress-wrap" style={{ "--percentage": probabilityPercent }}>
              <div className="circle-inner">
                <span style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#D6689C" }}>
                  {probabilityPercent}%
                </span>
                <span style={{ fontSize: "0.8rem", color: "#718096" }}>Probability</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "#FFF5F5", padding: "20px", borderRadius: "12px" }}>
              <h4 style={{ marginBottom: "10px" }}>Risk Level</h4>
              <span className={`risk-badge ${riskClass}`}>{riskLevel} Risk</span>
            </div>

            <div style={{ background: "#F7FAFC", padding: "20px", borderRadius: "12px" }}>
              <h4 style={{ marginBottom: "10px" }}>Model Probability</h4>
              <div style={{ width: "100%", height: "8px", background: "#E2E8F0", borderRadius: "4px" }}>
                <div
                  style={{
                    width: `${probabilityPercent}%`,
                    height: "100%",
                    background: "#D6689C",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.85rem", color: "#718096", marginTop: "5px" }}>
                Predicted PCOS probability: {probabilityPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded image preview (from Cloudinary) */}
        {imageUrl && (
          <div style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 10 }}>Uploaded Image</h4>
            <div style={{ textAlign: "center" }}>
              <img
                src={imageUrl}
                alt="Uploaded ultrasound"
                style={{ maxWidth: "100%", maxHeight: 360, borderRadius: 12 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="card mb-8">
        <h3 style={{ marginBottom: "10px" }}>Understanding Your Results</h3>
        <p style={{ color: "#4A5568", fontSize: "0.95rem", whiteSpace: "pre-line" }}>{narration}</p>

        <p style={{ color: "#718096", fontSize: "0.85rem", marginTop: "10px" }}>
          <strong>Disclaimer:</strong> This is a screening tool, not a medical diagnosis. Please consult a qualified healthcare professional.
        </p>
      </div>


      {/* Action Buttons */}
      <div className="action-buttons-container">
        <Link to="/check/combined" className="btn btn-primary">
          + Combine with Symptoms
        </Link>

        <button className="btn btn-outline" onClick={handleDownloadReport}>
          <FaDownload /> Download Report
        </button>

        <Link to="/diet" className="btn btn-white border" style={{ border: "2px solid #E2E8F0" }}>
          View Recommendations <FaArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default ImageResult;