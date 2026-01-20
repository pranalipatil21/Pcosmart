import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useAssessment } from "../context/AssessmentContext";
const BACKEND = import.meta.env.VITE_BACKEND_API_URL;
const COMBINED_URL = `${BACKEND}/model/combinedModel`;

// 19 features required by your fusion model (in training order)
const CLINICAL_FIELDS = [
  { key: "age_yrs", label: "Age (yrs)", type: "number" },
  { key: "weight_kg", label: "Weight (Kg)", type: "number", step: "0.1" },
  { key: "height_cm", label: "Height (Cm)", type: "number", step: "0.1" },
  { key: "bmi", label: "BMI (auto)", type: "number", readOnly: true, step: "0.01" },

  { key: "pulse_rate_bpm", label: "Pulse rate (bpm)", type: "number" },
  { key: "hb_g_dl", label: "Hb (g/dL)", type: "number", step: "0.1" },
  { key: "cycle_length_days", label: "Cycle length (days)", type: "number" },

  { key: "fsh_miu_ml", label: "FSH (mIU/mL)", type: "number", step: "0.01" },
  { key: "lh_miu_ml", label: "LH (mIU/mL)", type: "number", step: "0.01" },
  { key: "fsh_lh", label: "FSH/LH (auto)", type: "number", readOnly: true, step: "0.01" },

  { key: "hip_inch", label: "Hip (inch)", type: "number", step: "0.1" },
  { key: "waist_inch", label: "Waist (inch)", type: "number", step: "0.1" },

  { key: "tsh_miu_l", label: "TSH (mIU/L)", type: "number", step: "0.01" },
  { key: "amh_ng_ml", label: "AMH (ng/mL)", type: "number", step: "0.01" },
  { key: "prl_ng_ml", label: "PRL / Prolactin (ng/mL)", type: "number", step: "0.01" },
  { key: "vit_d3_ng_ml", label: "Vit D3 (ng/mL)", type: "number", step: "0.01" },

  { key: "follicle_no_l", label: "Follicle No. (L)", type: "number" },
  { key: "follicle_no_r", label: "Follicle No. (R)", type: "number" },
  { key: "endometrium_mm", label: "Endometrium (mm)", type: "number", step: "0.1" },
];

const CombinedTest = () => {
  const navigate = useNavigate();
  const { setMlResult } = useAssessment();

  const [stage, setStage] = useState("image"); // "image" | "clinical"
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [clinical, setClinical] = useState(() => {
    const init = {};
    CLINICAL_FIELDS.forEach((f) => (init[f.key] = ""));
    return init;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // auto compute BMI
  useEffect(() => {
    const w = Number(clinical.weight_kg);
    const hCm = Number(clinical.height_cm);
    if (Number.isFinite(w) && Number.isFinite(hCm) && w > 0 && hCm > 0) {
      const hM = hCm / 100;
      const bmi = w / (hM * hM);
      setClinical((p) => ({ ...p, bmi: bmi.toFixed(2) }));
    } else {
      setClinical((p) => ({ ...p, bmi: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinical.weight_kg, clinical.height_cm]);

  // auto compute FSH/LH
  useEffect(() => {
    const fsh = Number(clinical.fsh_miu_ml);
    const lh = Number(clinical.lh_miu_ml);
    if (Number.isFinite(fsh) && Number.isFinite(lh) && lh > 0) {
      setClinical((p) => ({ ...p, fsh_lh: (fsh / lh).toFixed(2) }));
    } else {
      setClinical((p) => ({ ...p, fsh_lh: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinical.fsh_miu_ml, clinical.lh_miu_ml]);

  const handleImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const totalSteps = 2;
  const currentStep = stage === "image" ? 1 : 2;
  const progressPercent = (currentStep / totalSteps) * 100;

  const validateClinical = () => {
    // require all except auto fields (still must exist but derived)
    const requiredKeys = CLINICAL_FIELDS.filter((f) => !f.readOnly).map((f) => f.key);

    for (const k of requiredKeys) {
      const v = clinical[k];
      if (v === "" || v === null || v === undefined) {
        return `Missing required field: ${k}`;
      }
      const n = Number(v);
      if (!Number.isFinite(n)) return `Invalid value for: ${k}`;
    }

    // derived must be present too
    if (clinical.bmi === "") return "BMI could not be computed. Please enter valid height & weight.";
    if (clinical.fsh_lh === "") return "FSH/LH could not be computed. Please enter valid FSH & LH.";

    return "";
  };

  const handleSubmitCombined = async () => {
    setError("");

    if (!file) {
      setError("Please upload an ultrasound image.");
      return;
    }

    const v = validateClinical();
    if (v) {
      setError(v);
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

      // Build payload (send clinical as JSON string)
      const clinicalPayload = {};
      Object.entries(clinical).forEach(([k, val]) => {
        clinicalPayload[k] = Number(val);
      });

      const form = new FormData();
      form.append("image", file); // backend should use upload.single("image")
      form.append("clinical", JSON.stringify(clinicalPayload)); // backend should JSON.parse(req.body.clinical)

      const res = await axios.post(COMBINED_URL, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      });

      setMlResult(res.data);
      navigate("/result/combined");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Combined prediction failed";
      setError(msg);

      if (e?.response?.status === 401) localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-spacing" style={{ maxWidth: "900px" }}>
      <div className="text-center mb-8">
        <span className="badge">
          Step {currentStep} of {totalSteps}
        </span>
        <h1 style={{ fontSize: "2.5rem", marginTop: "10px" }}>
          Combined <span style={{ color: "#D6689C" }}>Analysis</span>
        </h1>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            background: "#FFF5F5",
            border: "1px solid #FED7D7",
            color: "#C53030",
            marginBottom: 18,
          }}
        >
          {error}
        </div>
      )}

      {/* STAGE 1: IMAGE UPLOAD */}
      {stage === "image" && (
        <div className="card fade-in">
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Upload Ultrasound Image
          </h2>

          <label className="upload-zone">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={{ maxHeight: "300px", borderRadius: "10px" }}
              />
            ) : (
              <>
                <FaCloudUploadAlt
                  style={{
                    fontSize: "3rem",
                    color: "#D6689C",
                    marginBottom: "15px",
                  }}
                />
                <h3>Drop your ultrasound image here</h3>
                <p style={{ color: "#A0AEC0" }}>JPG, PNG • Max 10MB</p>
              </>
            )}
            <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
          </label>

          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <button
              className={`btn btn-primary ${!file ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setStage("clinical")}
              disabled={!file}
            >
              Next: Clinical Details <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: CLINICAL FORM */}
      {stage === "clinical" && (
        <div className="card fade-in">
          <h2 style={{ textAlign: "center", marginBottom: 8 }}>Clinical Details</h2>
          <p style={{ textAlign: "center", color: "#718096", marginBottom: 18 }}>
            Enter the required clinical/lab values used by the combined model.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "14px",
            }}
          >
            {CLINICAL_FIELDS.map((f) => (
              <label key={f.key} style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: "0.9rem", color: "#4A5568" }}>{f.label}</span>
                <input
                  type={f.type}
                  step={f.step || "1"}
                  className="input"
                  value={clinical[f.key]}
                  readOnly={!!f.readOnly}
                  onChange={(e) =>
                    setClinical((p) => ({
                      ...p,
                      [f.key]: e.target.value,
                    }))
                  }
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                    background: f.readOnly ? "#F7FAFC" : "white",
                  }}
                />
              </label>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
            <button className="btn btn-outline" onClick={() => setStage("image")} disabled={loading}>
              <FaArrowLeft /> Back
            </button>

            <button className="btn btn-primary" onClick={handleSubmitCombined} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Results"} <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinedTest;