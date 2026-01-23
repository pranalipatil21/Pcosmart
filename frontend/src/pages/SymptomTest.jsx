import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { useAssessment } from "../context/AssessmentContext";
const backendUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api"; 
const SIMPLE_URL = `${backendUrl}/model/simpleTextModel`;
const CLINICAL_URL = `${backendUrl}/model/clinicalTextModel`;

const symptomQuestions = [
  {
    id: "menstrualCycleType",
    type: "choice",
    question: "How regular are your menstrual cycles?",
    options: [
      { label: "Regular (28–30 days)", value: 2 },
      { label: "Irregular / Skips months", value: 4 },
    ],
  },
  {
    id: "averageCycleLength",
    type: "number",
    question: "What is your average menstrual cycle length (in days)?",
    placeholder: "e.g., 28",
    min: 10,
    max: 120,
  },
  { id: "weightGain", type: "boolean", question: "Recent unexplained weight gain?" },
  { id: "hairGrowth", type: "boolean", question: "Excess hair growth on face, chest, or back?" },
  { id: "skinDarkening", type: "boolean", question: "Darkening of skin around neck or armpits?" },
  { id: "hairLoss", type: "boolean", question: "Hair thinning / hair fall from scalp?" },
  { id: "pimples", type: "boolean", question: "Frequent pimples or acne?" },
  { id: "fastFood", type: "boolean", question: "Consume fast food frequently?" },
  { id: "regularExercise", type: "boolean", question: "Do you exercise regularly?" },
];

// Add constraints so user can't enter values that fail Mongoose mins
const BASIC_FIELDS = [
  { key: "age", label: "Age (years)", min: 10, max: 80, step: "1" },
  { key: "bmi", label: "BMI", min: 10, max: 80, step: "0.1" },
  { key: "pulseRate", label: "Pulse Rate (bpm)", min: 30, max: 220, step: "1" }, // backend min 30
  { key: "respiratoryRate", label: "Respiratory Rate (breaths/min)", min: 8, max: 60, step: "1" },
  { key: "hemoglobin", label: "Hemoglobin (g/dL)", min: 3, max: 25, step: "0.1" },
  { key: "bpSystolic", label: "BP Systolic (mmHg)", min: 50, max: 250, step: "1" }, // backend min 50
  { key: "bpDiastolic", label: "BP Diastolic (mmHg)", min: 30, max: 150, step: "1" }, // backend min 30
];

const SymptomTest = () => {
  const navigate = useNavigate();
  const { setMlResult } = useAssessment();

  const [testType, setTestType] = useState(null); // "simple" | "clinical"
  const [step, setStep] = useState("choose"); // "choose" | "symptoms" | "details"
  const [currentQ, setCurrentQ] = useState(0);

  const [symptoms, setSymptoms] = useState({});
  const [basic, setBasic] = useState({
    age: "",
    bmi: "",
    pulseRate: "",
    respiratoryRate: "",
    hemoglobin: "",
    bpSystolic: "",
    bpDiastolic: "",
  });

  const [clinical, setClinical] = useState({
    B_HCG_Test1: "",
    B_HCG_Test2: "",
    FSH: "",
    LH: "",
    FSHLH_Ratio: "",
    TSH: "",
    AMH: "",
    prolactin: "",
    vitaminD3: "",
    progesterone: "",
    randomBloodSugar: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const q = symptomQuestions[currentQ];

  const progress = useMemo(() => {
    return ((currentQ + 1) / symptomQuestions.length) * 100;
  }, [currentQ]);

  const selectedValue = symptoms[q?.id];

  const setSymptomAnswer = (id, value) => {
    setSymptoms((prev) => ({ ...prev, [id]: value }));
  };

  const canGoNext = useMemo(() => {
    if (!q) return false;
    const v = symptoms[q.id];
    return v !== undefined && v !== null && v !== "";
  }, [q, symptoms]);

  const handleNextQuestion = () => {
    if (!canGoNext) return;

    if (currentQ < symptomQuestions.length - 1) {
      setCurrentQ((p) => p + 1);
    } else {
      setStep("details");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("symptoms");
      return;
    }
    setCurrentQ((p) => Math.max(0, p - 1));
  };

  const normalizeNumber = (v) => {
    if (v === "" || v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const validateAll = () => {
    if (!testType) return "Please select assessment type.";

    // Validate basic required + range
    for (const f of BASIC_FIELDS) {
      const n = normalizeNumber(basic[f.key]);
      if (n === null) return `Please enter a valid value for "${f.key}".`;
      if (n < f.min || n > f.max) return `${f.label} must be between ${f.min} and ${f.max}.`;
    }

    // Validate symptom answers
    for (const item of symptomQuestions) {
      const v = symptoms[item.id];
      if (v === undefined || v === null || v === "") {
        return `Missing symptom answer: "${item.id}".`;
      }
    }

    // Validate menstrualCycleType must be 2 or 4
    const mct = Number(symptoms.menstrualCycleType);
    if (![2, 4].includes(mct)) {
      return `menstrualCycleType must be 2 (Regular) or 4 (Irregular).`;
    }

    // Validate averageCycleLength numeric range
    const cl = normalizeNumber(symptoms.averageCycleLength);
    if (cl === null) return `Please enter a valid value for "averageCycleLength".`;
    if (cl < 10 || cl > 120) return `averageCycleLength must be between 10 and 120 days.`;

    return "";
  };

  const buildPayload = () => {
    const payload = {
      // required basics
      age: normalizeNumber(basic.age),
      bmi: normalizeNumber(basic.bmi),
      pulseRate: normalizeNumber(basic.pulseRate),
      respiratoryRate: normalizeNumber(basic.respiratoryRate),
      hemoglobin: normalizeNumber(basic.hemoglobin),
      bpSystolic: normalizeNumber(basic.bpSystolic),
      bpDiastolic: normalizeNumber(basic.bpDiastolic),

      // symptoms
      menstrualCycleType: Number(symptoms.menstrualCycleType),
      averageCycleLength: normalizeNumber(symptoms.averageCycleLength),

      // booleans
      weightGain: symptoms.weightGain === true,
      hairGrowth: symptoms.hairGrowth === true,
      skinDarkening: symptoms.skinDarkening === true,
      hairLoss: symptoms.hairLoss === true,
      pimples: symptoms.pimples === true,
      fastFood: symptoms.fastFood === true,
      regularExercise: symptoms.regularExercise === true,
    };

    if (testType === "clinical") {
      Object.assign(payload, {
        B_HCG_Test1: normalizeNumber(clinical.B_HCG_Test1),
        B_HCG_Test2: normalizeNumber(clinical.B_HCG_Test2),
        FSH: normalizeNumber(clinical.FSH),
        LH: normalizeNumber(clinical.LH),
        FSHLH_Ratio: normalizeNumber(clinical.FSHLH_Ratio),
        TSH: normalizeNumber(clinical.TSH),
        AMH: normalizeNumber(clinical.AMH),
        prolactin: normalizeNumber(clinical.prolactin),
        vitaminD3: normalizeNumber(clinical.vitaminD3),
        progesterone: normalizeNumber(clinical.progesterone),
        randomBloodSugar: normalizeNumber(clinical.randomBloodSugar),
      });
    }

    return payload;
  };

  const handleSubmit = async () => {
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in. Please login again.");
      navigate("/login");
      return;
    }

    const validationMsg = validateAll();
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    const url = testType === "clinical" ? CLINICAL_URL : SIMPLE_URL;
    const payload = buildPayload();

    try {
      setLoading(true);
      const res = await axios.post(url, payload, {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMlResult(res.data);
      navigate("/result/symptom");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Request failed";
      setError(msg);

      if (e?.response?.status === 401) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderOptionCard = (isSelected, label, onClick) => (
    <div
      className={`option-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: "2px solid",
          borderColor: isSelected ? "#D6689C" : "#CBD5E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isSelected ? "#D6689C" : "transparent",
        }}
      >
        <FaCheck size={12} />
      </div>

      <span style={{ fontSize: "1rem", color: "#4A5568" }}>{label}</span>
    </div>
  );

  return (
    <div className="container page-spacing" style={{ maxWidth: "900px" }}>
      <div className="text-center mb-8">
        <h1 style={{ fontSize: "2.5rem", marginTop: "10px" }}>
          Symptom <span style={{ color: "#D6689C" }}>Assessment</span>
        </h1>
        <p style={{ color: "#718096" }}>
          Choose the assessment type, answer symptoms, then enter required health details.
        </p>
      </div>
      <br></br>
      {/* STEP 1: choose */}
      {step === "choose" && (
        <div className="card text-center">
          <h2>Select Assessment Type</h2>
          <p style={{ color: "#718096" }}>
            Simple requires basic vitals. Clinical includes optional lab values too.
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              marginTop: "30px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-outline"
              onClick={() => {
                setTestType("simple");
                setStep("symptoms");
              }}
            >
              Simple Test
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                setTestType("clinical");
                setStep("symptoms");
              }}
            >
              Clinical Test (Simple + Lab)
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: symptoms */}
      {step === "symptoms" && q && (
        <>
          <div className="progress-track" style={{ marginBottom: "18px" }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span className="badge">
                Question {currentQ + 1} of {symptomQuestions.length}
              </span>
              <span className="badge" style={{ background: "#F7FAFC", color: "#4A5568" }}>
                Mode: {testType}
              </span>
            </div>

            <h3 style={{ fontSize: "1.3rem", margin: "18px 0 20px", color: "#2D3748" }}>
              {q.question}
            </h3>

            {q.type === "choice" && (
              <div className="options-list">
                {q.options.map((opt) => (
                  <div
                    key={`${q.id}-${opt.value}`}
                    className={`option-card ${selectedValue === opt.value ? "selected" : ""}`}
                    onClick={() => setSymptomAnswer(q.id, opt.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setSymptomAnswer(q.id, opt.value);
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: selectedValue === opt.value ? "#D6689C" : "#CBD5E0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: selectedValue === opt.value ? "#D6689C" : "transparent",
                      }}
                    >
                      <FaCheck size={12} />
                    </div>

                    <span style={{ fontSize: "1rem", color: "#4A5568" }}>{opt.label}</span>
                  </div>
                ))}
              </div>
            )}

            {q.type === "boolean" && (
              <div className="options-list">
                {renderOptionCard(selectedValue === true, "Yes", () =>
                  setSymptomAnswer(q.id, true)
                )}
                {renderOptionCard(selectedValue === false, "No", () =>
                  setSymptomAnswer(q.id, false)
                )}
              </div>
            )}

            {q.type === "number" && (
              <div style={{ display: "grid", gap: 10 }}>
                <input
                  className="input"
                  type="number"
                  min={q.min}
                  max={q.max}
                  placeholder={q.placeholder}
                  value={symptoms[q.id] ?? ""}
                  onChange={(e) => setSymptomAnswer(q.id, e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                />
                <p style={{ color: "#718096", fontSize: "0.85rem", margin: 0 }}>
                  Tip: enter your typical cycle length (e.g., 28, 35, 45).
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (currentQ === 0) {
                    setStep("choose");
                    setTestType(null);
                    setSymptoms({});
                  } else {
                    handleBack();
                  }
                }}
              >
                <FaArrowLeft /> Back
              </button>

              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
                disabled={!canGoNext}
                style={{ opacity: !canGoNext ? 0.5 : 1 }}
              >
                {currentQ === symptomQuestions.length - 1 ? "Continue" : "Next"}{" "}
                <FaArrowRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* STEP 3: details + submit */}
      {step === "details" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span className="badge">Required Details</span>
            <span className="badge" style={{ background: "#F7FAFC", color: "#4A5568" }}>
              Mode: {testType}
            </span>
          </div>

          <h3 style={{ marginTop: 18 }}>Enter your details</h3>

          {error && (
            <div
              style={{
                background: "#FFF5F5",
                border: "1px solid #FED7D7",
                padding: "12px",
                borderRadius: "10px",
                color: "#C53030",
                marginTop: "12px",
              }}
            >
              {error}
            </div>
          )}

          {/* Basic required fields (FIXED) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginTop: "16px",
            }}
          >
            {BASIC_FIELDS.map(({ key, label, min, max, step }) => (
              <label key={key} style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: "0.9rem", color: "#4A5568" }}>{label}</span>
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  className="input"
                  value={basic[key]}
                  onChange={(e) => setBasic((p) => ({ ...p, [key]: e.target.value }))}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #E2E8F0",
                  }}
                />
              </label>
            ))}
          </div>

          {/* Clinical optional labs */}
          {testType === "clinical" && (
            <>
              <h3 style={{ marginTop: 24 }}>Clinical / Lab values (optional)</h3>
              <p style={{ color: "#718096", marginTop: 6, fontSize: "0.9rem" }}>
                If you don’t have these, you can leave them blank.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                  marginTop: "12px",
                }}
              >
                {[
                  ["B_HCG_Test1", "B-HCG Test 1"],
                  ["B_HCG_Test2", "B-HCG Test 2"],
                  ["FSH", "FSH"],
                  ["LH", "LH"],
                  ["FSHLH_Ratio", "FSH/LH Ratio"],
                  ["TSH", "TSH"],
                  ["AMH", "AMH"],
                  ["prolactin", "Prolactin"],
                  ["vitaminD3", "Vitamin D3"],
                  ["progesterone", "Progesterone"],
                  ["randomBloodSugar", "Random Blood Sugar"],
                ].map(([key, label]) => (
                  <label key={key} style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: "0.9rem", color: "#4A5568" }}>{label}</span>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={clinical[key]}
                      onChange={(e) => setClinical((p) => ({ ...p, [key]: e.target.value }))}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                      }}
                    />
                  </label>
                ))}
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
            <button className="btn btn-outline" onClick={handleBack} disabled={loading}>
              <FaArrowLeft /> Back
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Submitting..." : "Get Result"} <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomTest;