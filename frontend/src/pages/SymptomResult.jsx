import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaDownload, FaArrowRight } from "react-icons/fa";
import { useAssessment } from "../context/AssessmentContext";

const SymptomResult = () => {
  const navigate = useNavigate();
  const { mlResult, setMlResult } = useAssessment();

  // Guard: if user refreshes or lands directly
  if (!mlResult) {
    return <Navigate to="/symptom-test" replace />;
  }

  const probability = mlResult?.mlResult?.probability ?? 0;
  const probabilityPercent = Math.round(probability * 100);

  const riskLevel = mlResult?.mlResult?.risk_level || "Unknown";
  const topFactors = mlResult?.mlResult?.top_factors || [];
  const narration = mlResult?.mlResult?.narration || "";

  const riskClass =
    riskLevel === "Low"
      ? "risk-low"
      : riskLevel === "High"
        ? "risk-high"
        : "risk-moderate";


  const downloadPdfFromBase64 = (base64, filename) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);

    const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "PCOSmart_Report.pdf";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="container page-spacing" style={{ maxWidth: "1000px" }}>
      <div className="text-center mb-10">
        <span className="badge">Analysis Complete</span>
        <h1 style={{ fontSize: "2.5rem", marginTop: "10px" }}>
          Symptom <span style={{ color: "#D6689C" }}>Results</span>
        </h1>
        <p style={{ color: "#718096" }}>
          Submission ID: <strong>{mlResult.submissionId}</strong> | Mode:{" "}
          <strong>{mlResult.inputMode}</strong>
        </p>
      </div>

      {/* Main Result Area */}
      <div className="card mb-8">
        <div className="flex" style={{ gap: "40px", flexWrap: "wrap" }}>
          {/* Circle Graph */}
          <div
            style={{
              flex: 1,
              minWidth: "250px",
              textAlign: "center",
              borderRight: "1px solid #eee",
            }}
          >
            <h4 style={{ color: "#718096", marginBottom: "20px" }}>
              PCOS Probability Based on Your Inputs
            </h4>

            <div
              className="circle-progress-wrap"
              style={{ "--percentage": probabilityPercent }}
            >
              <div className="circle-inner">
                <span
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: "#D6689C",
                  }}
                >
                  {probabilityPercent}%
                </span>
                <span style={{ fontSize: "0.8rem", color: "#718096" }}>
                  Probability
                </span>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <span className={`risk-badge ${riskClass}`}>{riskLevel} Risk</span>
            </div>
          </div>

          {/* XAI / Feature Importance */}
          <div style={{ flex: 2 }}>
            <h4 style={{ marginBottom: "20px" }}>Symptom Impact Analysis</h4>

            {topFactors.length === 0 ? (
              <p style={{ color: "#718096" }}>No factor breakdown returned.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {topFactors.map((item, idx) => {
                  const impactValue = Math.min(Math.abs(item.impact) * 10, 100);

                  return (
                    <div key={idx}>
                      <div
                        className="flex justify-between text-sm mb-1"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <span>{item.feature}</span>
                        <span style={{ fontWeight: "bold" }}>
                          {impactValue.toFixed(0)}%
                        </span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          background: "#F7FAFC",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            width: `${impactValue}%`,
                            height: "100%",
                            background:
                              item.direction === "increases_risk" ? "#D6689C" : "#48BB78",
                            borderRadius: "4px",
                            opacity: 0.85,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="card mb-8">
        <h3 style={{ marginBottom: "10px" }}>Understanding Your Results</h3>

        <p
          style={{ color: "#4A5568", fontSize: "0.95rem" }}
          dangerouslySetInnerHTML={{
            __html: String(narration).replace(/\n/g, "<br/>"),
          }}
        />

        <p style={{ color: "#718096", fontSize: "0.85rem", marginTop: "10px" }}>
          <strong>Disclaimer:</strong> This is a screening tool, not a medical diagnosis.
          Please consult a qualified healthcare professional.
        </p>
      </div>

      {/* Actions */}
      <div className="action-buttons-container">
        <Link to="/check/combined" className="btn btn-primary">
          + Combine with Image Test
        </Link>

        <button
          className="btn btn-outline"
          onClick={() => {
            const report = mlResult?.report;
            if (!report?.base64) alert("Report not available");
            else downloadPdfFromBase64(report.base64, report.filename);
          }}
        >
          <FaDownload /> Download Report
        </button>

        <Link
          to="/diet"
          className="btn btn-white border"
          style={{ border: "2px solid #E2E8F0" }}
        >
          View Recommendations <FaArrowRight />
        </Link>

        <button
          className="btn btn-outline"
          onClick={() => {
            setMlResult(null);
            navigate("/check/symptom");
          }}
        >
          Start Again
        </button>
      </div>
    </div>
  );
};

export default SymptomResult;