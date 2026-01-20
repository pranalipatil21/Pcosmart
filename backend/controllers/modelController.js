const axios = require("axios");
const cloudinary = require("../config/cloudinary");
const SimpleDataTest = require("../models/SimpleDataTest");
const ClinicalDataTest = require("../models/ClinicalDataTest");
const ImageTest = require("../models/ImageDataTest");
const CombinedDataTest = require("../models/CombinedDataTest");
const FormData = require("form-data");
const { generatePredictionPdfBuffer } = require("./pdfGenerator");
const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

// Helper: convert boolean-ish values to 0/1 
const to01 = (v) => {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number") return v ? 1 : 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["1", "true", "yes", "y"].includes(s)) return 1;
    if (["0", "false", "no", "n"].includes(s)) return 0;
  }
  return v ? 1 : 0;
};

// --- NEW HELPER: Generate Recommendations based on Risk ---
const getRecommendations = (riskLevel, probability) => {
  const prob = Number(probability) || 0;
  const risk = (riskLevel || "").toLowerCase();

  // Logic: High Risk
  if (risk.includes("high") || prob >= 0.7) {
    return {
      diet: "Strict Low-Glycemic Index (GI) diet. Eliminate processed sugars, white bread, and sugary drinks. Focus on anti-inflammatory foods like fatty fish (salmon), turmeric, ginger, and leafy greens. Consider intermittent fasting (14:10 window) after consulting a doctor.",
      exercise: "Aim for 45+ minutes of daily activity. Prioritize High-Intensity Interval Training (HIIT) to improve insulin sensitivity and Strength Training (3-4 times/week) to build muscle mass and boost metabolism."
    };
  }
  // Logic: Moderate Risk
  else if (risk.includes("moderate") || (prob >= 0.35 && prob < 0.7)) {
    return {
      diet: "Balanced Plate Method: 50% vegetables, 25% lean protein, 25% high-fiber carbs. Limit dairy and gluten if you notice bloating or acne. Stay hydrated (2-3 liters of water daily) and reduce caffeine intake.",
      exercise: "Daily 30-minute moderate cardio (brisk walking, swimming, or cycling). Incorporate resistance training or yoga 2-3 times a week to manage cortisol (stress) levels."
    };
  }
  // Logic: Low Risk
  else {
    return {
      diet: "Maintain a nutrient-dense whole food diet. Focus on fiber-rich fruits, vegetables, and whole grains. Avoid late-night snacking and excessive processed foods to keep hormones balanced.",
      exercise: "Maintain an active lifestyle. Aim for 150 minutes of moderate activity per week (e.g., dancing, hiking, yoga). Regular stretching is recommended to maintain flexibility and blood flow."
    };
  }
};

// Takes simple form data from frontend, saves it, sends payload to ML service, returns ML output.
const sendDataToSimpleTextModel = async (req, res) => {
  console.log("req.user =", req.user);
  try {
    const {
      age, bmi, pulseRate, respiratoryRate, hemoglobin, menstrualCycleType, 
      averageCycleLength, weightGain, hairGrowth, skinDarkening, hairLoss, 
      pimples, fastFood, regularExercise, bpSystolic, bpDiastolic,
    } = req.body;

    const required = {
      age, bmi, pulseRate, respiratoryRate, hemoglobin, menstrualCycleType,
      averageCycleLength, weightGain, hairGrowth, skinDarkening, hairLoss,
      pimples, fastFood, regularExercise, bpSystolic, bpDiastolic,
    };

    for (const [k, v] of Object.entries(required)) {
      if (v === undefined || v === null) {
        return res.status(400).json({ message: `Missing required field: ${k}` });
      }
    }

    const cycleVal = String(menstrualCycleType);
    if (!["2", "4"].includes(cycleVal)) {
      return res.status(400).json({ message: "menstrualCycleType must be 2 (Regular) or 4 (Irregular)" });
    }

    if (!ML_SERVICE_URL) {
      return res.status(500).json({ message: "ML_SERVICE_URL not set in environment" });
    }

    // Save input in Mongo
    const saved = await SimpleDataTest.create({
      userId: req.user?._id,
      age: Number(age),
      bmi: Number(bmi),
      pulseRate: Number(pulseRate),
      respiratoryRate: Number(respiratoryRate),
      hemoglobin: Number(hemoglobin),
      menstrualCycleType: Number(cycleVal),
      averageCycleLength: Number(averageCycleLength),
      weightGain: Boolean(to01(weightGain)),
      hairGrowth: Boolean(to01(hairGrowth)),
      skinDarkening: Boolean(to01(skinDarkening)),
      hairLoss: Boolean(to01(hairLoss)),
      pimples: Boolean(to01(pimples)),
      fastFood: Boolean(to01(fastFood)),
      regularExercise: Boolean(to01(regularExercise)),
      bpSystolic: Number(bpSystolic),
      bpDiastolic: Number(bpDiastolic),
    });

    // Payload for ML service
    const mlPayload = {
      age_yrs: Number(age),
      bmi: Number(bmi),
      pulse_rate_bpm: Number(pulseRate),
      rr_breaths_min: Number(respiratoryRate),
      hb_g_dl: Number(hemoglobin),
      cycle_r_i: cycleVal, 
      cycle_length_days: Number(averageCycleLength),
      weight_gain_y_n: to01(weightGain),
      hair_growth_y_n: to01(hairGrowth),
      skin_darkening_y_n: to01(skinDarkening),
      hair_loss_y_n: to01(hairLoss),
      pimples_y_n: to01(pimples),
      fast_food_y_n: to01(fastFood),
      reg_exercise_y_n: to01(regularExercise),
      bp_systolic_mmhg: Number(bpSystolic),
      bp_diastolic_mmhg: Number(bpDiastolic),
    };

    // Call ML
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict/simple`, mlPayload, {
      timeout: 30000,
    });

    // --- ADDED: Generate Recommendations ---
    const recommendations = getRecommendations(mlResponse.data.risk_level, mlResponse.data.probability);
    mlResponse.data.recommendations = recommendations; // Attach to ML response object

    // Save ML output
    saved.modelOutput = mlResponse.data;
    await saved.save();

    // report generation
    let reportPdfBase64 = null;
    let reportFilename = null;

    try {
      const pdfBuffer = await generatePredictionPdfBuffer({
        inputMode: "simple",
        submissionId: saved._id.toString(),
        mlResult: mlResponse.data, // This now includes .recommendations
        inputSnapshot: {
          age: saved.age, bmi: saved.bmi, pulseRate: saved.pulseRate,
          respiratoryRate: saved.respiratoryRate, hemoglobin: saved.hemoglobin,
          menstrualCycleType: saved.menstrualCycleType, averageCycleLength: saved.averageCycleLength,
          bpSystolic: saved.bpSystolic, bpDiastolic: saved.bpDiastolic,
          weightGain: saved.weightGain, hairGrowth: saved.hairGrowth,
          skinDarkening: saved.skinDarkening, hairLoss: saved.hairLoss,
          pimples: saved.pimples, fastFood: saved.fastFood,
          regularExercise: saved.regularExercise,
        },
      });

      reportPdfBase64 = pdfBuffer.toString("base64");
      reportFilename = `PCOSmart_simple_${saved._id}.pdf`;
    } catch (e) {
      console.error("PDF generation failed (simple):", e.message);
    }

    return res.status(200).json({
      message: "Prediction completed",
      submissionId: saved._id,
      inputMode: "simple",
      mlResult: mlResponse.data,
      report: reportPdfBase64
        ? { filename: reportFilename, mimeType: "application/pdf", base64: reportPdfBase64 }
        : null,
    });
  } catch (err) {
    console.error("sendDataToSimpleTextModel error:", err?.response?.data || err.message);
    return res.status(500).json({
      message: "Failed to process simple text model request",
      error: err?.response?.data || err.message,
    });
  }
};


const sendDataToClinicalTextModel = async (req, res) => {
  try {
    const {
      age, bmi, pulseRate, respiratoryRate, hemoglobin, menstrualCycleType,
      averageCycleLength, weightGain, hairGrowth, skinDarkening, hairLoss,
      pimples, fastFood, regularExercise, bpSystolic, bpDiastolic,
      B_HCG_Test1, B_HCG_Test2, FSH, LH, FSHLH_Ratio, TSH, AMH, prolactin,
      vitaminD3, progesterone, randomBloodSugar,
    } = req.body;

    const requiredBasic = {
      age, bmi, pulseRate, respiratoryRate, hemoglobin, menstrualCycleType,
      averageCycleLength, weightGain, hairGrowth, skinDarkening, hairLoss,
      pimples, fastFood, regularExercise, bpSystolic, bpDiastolic,
    };

    for (const [k, v] of Object.entries(requiredBasic)) {
      if (v === undefined || v === null) {
        return res.status(400).json({ message: `Missing required field: ${k}` });
      }
    }

    const cycleVal = String(menstrualCycleType);
    if (!["2", "4"].includes(cycleVal)) {
      return res.status(400).json({ message: "menstrualCycleType must be 2 (Regular) or 4 (Irregular)" });
    }

    if (!ML_SERVICE_URL) {
      return res.status(500).json({ message: "ML_SERVICE_URL not set in environment" });
    }

    // Save input in Mongo 
    const saved = await ClinicalDataTest.create({
      userId: req.user?._id,
      age: Number(age), bmi: Number(bmi), pulseRate: Number(pulseRate),
      respiratoryRate: Number(respiratoryRate), hemoglobin: Number(hemoglobin),
      menstrualCycleType: Number(cycleVal), averageCycleLength: Number(averageCycleLength),
      weightGain: Boolean(to01(weightGain)), hairGrowth: Boolean(to01(hairGrowth)),
      skinDarkening: Boolean(to01(skinDarkening)), hairLoss: Boolean(to01(hairLoss)),
      pimples: Boolean(to01(pimples)), fastFood: Boolean(to01(fastFood)),
      regularExercise: Boolean(to01(regularExercise)),
      bpSystolic: Number(bpSystolic), bpDiastolic: Number(bpDiastolic),
      // labs 
      betaHcg1: B_HCG_Test1 !== undefined && B_HCG_Test1 !== null ? Number(B_HCG_Test1) : null,
      betaHcg2: B_HCG_Test2 !== undefined && B_HCG_Test2 !== null ? Number(B_HCG_Test2) : null,
      fsh: FSH !== undefined && FSH !== null ? Number(FSH) : null,
      lh: LH !== undefined && LH !== null ? Number(LH) : null,
      fshLhRatio: FSHLH_Ratio !== undefined && FSHLH_Ratio !== null ? Number(FSHLH_Ratio) : null,
      tsh: TSH !== undefined && TSH !== null ? Number(TSH) : null,
      amh: AMH !== undefined && AMH !== null ? Number(AMH) : null,
      prolactin: prolactin !== undefined && prolactin !== null ? Number(prolactin) : null,
      vitaminD3: vitaminD3 !== undefined && vitaminD3 !== null ? Number(vitaminD3) : null,
      progesterone: progesterone !== undefined && progesterone !== null ? Number(progesterone) : null,
      rbs: randomBloodSugar !== undefined && randomBloodSugar !== null ? Number(randomBloodSugar) : null,
    });

    // Payload for ML service 
    const mlPayload = {
      age_yrs: Number(age), bmi: Number(bmi), pulse_rate_bpm: Number(pulseRate),
      rr_breaths_min: Number(respiratoryRate), hb_g_dl: Number(hemoglobin),
      cycle_r_i: cycleVal, cycle_length_days: Number(averageCycleLength),
      weight_gain_y_n: to01(weightGain), hair_growth_y_n: to01(hairGrowth),
      skin_darkening_y_n: to01(skinDarkening), hair_loss_y_n: to01(hairLoss),
      pimples_y_n: to01(pimples), fast_food_y_n: to01(fastFood),
      reg_exercise_y_n: to01(regularExercise),
      bp_systolic_mmhg: Number(bpSystolic), bp_diastolic_mmhg: Number(bpDiastolic),
      // labs
      i_beta_hcg_miu_ml: B_HCG_Test1 !== undefined && B_HCG_Test1 !== null ? Number(B_HCG_Test1) : null,
      ii_beta_hcg_miu_ml: B_HCG_Test2 !== undefined && B_HCG_Test2 !== null ? Number(B_HCG_Test2) : null,
      fsh_miu_ml: FSH !== undefined && FSH !== null ? Number(FSH) : null,
      lh_miu_ml: LH !== undefined && LH !== null ? Number(LH) : null,
      fsh_lh: FSHLH_Ratio !== undefined && FSHLH_Ratio !== null ? Number(FSHLH_Ratio) : null,
      tsh_miu_l: TSH !== undefined && TSH !== null ? Number(TSH) : null,
      amh_ng_ml: AMH !== undefined && AMH !== null ? Number(AMH) : null,
      prl_ng_ml: prolactin !== undefined && prolactin !== null ? Number(prolactin) : null,
      vit_d3_ng_ml: vitaminD3 !== undefined && vitaminD3 !== null ? Number(vitaminD3) : null,
      prg_ng_ml: progesterone !== undefined && progesterone !== null ? Number(progesterone) : null,
      rbs_mg_dl: randomBloodSugar !== undefined && randomBloodSugar !== null ? Number(randomBloodSugar) : null,
    };

    // Call ML
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict/clinical`, mlPayload, {
      timeout: 30000,
    });

    // --- ADDED: Generate Recommendations ---
    const recommendations = getRecommendations(mlResponse.data.risk_level, mlResponse.data.probability);
    mlResponse.data.recommendations = recommendations;

    // Save ML output
    saved.modelOutput = mlResponse.data;
    await saved.save();

    let reportPdfBase64 = null;
    let reportFilename = null;

    try {
      const pdfBuffer = await generatePredictionPdfBuffer({
        inputMode: "clinical",
        submissionId: saved._id.toString(),
        mlResult: mlResponse.data, // now contains recommendations
        inputSnapshot: {
          age: saved.age, bmi: saved.bmi, pulseRate: saved.pulseRate,
          respiratoryRate: saved.respiratoryRate, hemoglobin: saved.hemoglobin,
          menstrualCycleType: saved.menstrualCycleType, averageCycleLength: saved.averageCycleLength,
          bpSystolic: saved.bpSystolic, bpDiastolic: saved.bpDiastolic,
          weightGain: saved.weightGain, hairGrowth: saved.hairGrowth,
          skinDarkening: saved.skinDarkening, hairLoss: saved.hairLoss,
          pimples: saved.pimples, fastFood: saved.fastFood,
          regularExercise: saved.regularExercise,
          // labs 
          betaHcg1: saved.betaHcg1, betaHcg2: saved.betaHcg2,
          fsh: saved.fsh, lh: saved.lh, fshLhRatio: saved.fshLhRatio,
          tsh: saved.tsh, amh: saved.amh, prolactin: saved.prolactin,
          vitaminD3: saved.vitaminD3, progesterone: saved.progesterone, rbs: saved.rbs,
        },
      });

      reportPdfBase64 = pdfBuffer.toString("base64");
      reportFilename = `PCOSmart_clinical_${saved._id}.pdf`;
    } catch (e) {
      console.error("PDF generation failed (clinical):", e.message);
    }

    return res.status(200).json({
      message: "Prediction completed",
      submissionId: saved._id,
      inputMode: "clinical",
      mlResult: mlResponse.data,
      report: reportPdfBase64
        ? { filename: reportFilename, mimeType: "application/pdf", base64: reportPdfBase64 }
        : null,
    });
  } catch (err) {
    console.error("sendDataToClinicalTextModel error:", err?.response?.data || err.message);
    return res.status(500).json({
      message: "Failed to process clinical text model request",
      error: err?.response?.data || err.message,
    });
  }
};

const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", ...options },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

const sendImageToImageModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required (field name: image)" });
    }
    if (!ML_SERVICE_URL) {
      return res.status(500).json({ message: "ML_SERVICE_URL not set in environment" });
    }

    // 1) Upload original image to Cloudinary
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "pcosmart/ultrasound",
    });

    // 2) Call ML service (/predict/image) with same image bytes
    const form = new FormData();
    form.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict/image`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    // --- ADDED: Generate Recommendations ---
    const recommendations = getRecommendations(mlResponse.data.risk_level, mlResponse.data.probability);
    mlResponse.data.recommendations = recommendations;

    // 3) Save to Mongo
    const saved = await ImageTest.create({
      userId: req.user?._id,
      imageUrl: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      modelOutput: mlResponse.data,
    });

    let reportPdfBase64 = null;
    let reportFilename = null;

    try {
      const pdfBuffer = await generatePredictionPdfBuffer({
        inputMode: "image",
        submissionId: saved._id.toString(),
        mlResult: mlResponse.data, // contains recommendations
        imageUrl: saved.imageUrl, 
        inputSnapshot: {
          originalName: saved.originalName,
        },
      });

      reportPdfBase64 = pdfBuffer.toString("base64");
      reportFilename = `PCOSmart_image_${saved._id}.pdf`;
    } catch (e) {
      console.error("PDF generation failed (image):", e.message);
    }

    // 4) Return to frontend 
    return res.status(200).json({
      message: "Prediction completed",
      submissionId: saved._id,
      inputMode: "image",
      imageUrl: saved.imageUrl,
      mlResult: mlResponse.data,
      report: reportPdfBase64
        ? { filename: reportFilename, mimeType: "application/pdf", base64: reportPdfBase64 }
        : null,
    });
  } catch (err) {
    console.error("sendImageToImageModel error:", err?.response?.data || err.message);
    return res.status(500).json({
      message: "Failed to process image model request",
      error: err?.response?.data || err.message,
    });
  }
};

const REQUIRED_COMBINED_KEYS = [
  "age_yrs",
  "weight_kg",
  "height_cm",
  "bmi",
  "pulse_rate_bpm",
  "hb_g_dl",
  "cycle_length_days",
  "fsh_miu_ml",
  "lh_miu_ml",
  "fsh_lh",
  "hip_inch",
  "waist_inch",
  "tsh_miu_l",
  "amh_ng_ml",
  "prl_ng_ml",
  "vit_d3_ng_ml",
  "follicle_no_l",
  "follicle_no_r",
  "endometrium_mm",
];

const sendDataToCombinedModel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required (field name: image)" });
    }
    if (!ML_SERVICE_URL) {
      return res.status(500).json({ message: "ML_SERVICE_URL not set in environment" });
    }

    // clinical comes from multipart field "clinical" as a JSON string
    let clinical = {};
    try {
      clinical = JSON.parse(req.body.clinical || "{}");
    } catch {
      return res.status(400).json({ message: "Invalid clinical JSON" });
    }

    // Validate required fields
    for (const k of REQUIRED_COMBINED_KEYS) {
      if (clinical[k] === undefined || clinical[k] === null || clinical[k] === "") {
        return res.status(400).json({ message: `Missing required clinical field: ${k}` });
      }
      const num = Number(clinical[k]);
      if (!Number.isFinite(num)) {
        return res.status(400).json({ message: `Invalid clinical value for: ${k}` });
      }
      clinical[k] = num; // normalize to number
    }

    // 1) Upload original image to Cloudinary
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "pcosmart/combined",
    });

    // 2) Call ML service /predict/combined (multipart: image + clinical)
    const form = new FormData();
    form.append("image", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append("clinical", JSON.stringify(clinical));

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict/combined`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    // --- ADDED: Generate Recommendations ---
    const recommendations = getRecommendations(mlResponse.data.risk_level, mlResponse.data.probability);
    mlResponse.data.recommendations = recommendations;

    // 3) Save to Mongo
    const saved = await CombinedDataTest.create({
      userId: req.user?._id,
      imageUrl: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      clinical,
      modelOutput: mlResponse.data,
    });

    // 4) Generate PDF report right now 
    let report = null;
    try {
      const pdfBuffer = await generatePredictionPdfBuffer({
        inputMode: "combined",
        submissionId: saved._id.toString(),
        mlResult: mlResponse.data, // contains recommendations
        imageUrl: saved.imageUrl,
        inputSnapshot: {
          ...clinical,
        },
      });

      report = {
        filename: `PCOSmart_combined_${saved._id}.pdf`,
        mimeType: "application/pdf",
        base64: pdfBuffer.toString("base64"),
      };
    } catch (e) {
      console.error("PDF generation failed (combined):", e.message);
    }

    // 5) Return to frontend
    return res.status(200).json({
      message: "Prediction completed",
      submissionId: saved._id,
      inputMode: "combined",
      imageUrl: saved.imageUrl,
      mlResult: mlResponse.data,
      report,
    });
  } catch (err) {
    console.error("sendDataToCombinedModel error:", err?.response?.data || err.message);
    return res.status(500).json({
      message: "Failed to process combined model request",
      error: err?.response?.data || err.message,
    });
  }
};

module.exports = {
  sendDataToSimpleTextModel,
  sendDataToClinicalTextModel,
  sendImageToImageModel,
  sendDataToCombinedModel,
};