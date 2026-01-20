const mongoose = require("mongoose");

const ClinicalDataTestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // --- Simple fields ---
        age: { type: Number, required: true, min: 10, max: 70 },
        bmi: { type: Number, required: true, min: 10, max: 60 },

        pulseRate: { type: Number, required: true, min: 30, max: 220 },
        respiratoryRate: { type: Number, required: true, min: 5, max: 80 },
        hemoglobin: { type: Number, required: true, min: 1, max: 25 },

        menstrualCycleType: {
            type: Number,
            required: true,
            enum: [2, 4],
        },

        averageCycleLength: { type: Number, required: true, min: 1, max: 120 },

        weightGain: { type: Boolean, required: true },
        hairGrowth: { type: Boolean, required: true },
        skinDarkening: { type: Boolean, required: true },
        hairLoss: { type: Boolean, required: true },
        pimples: { type: Boolean, required: true },

        fastFood: { type: Boolean, required: true },
        regularExercise: { type: Boolean, required: true },

        bpSystolic: { type: Number, required: true, min: 50, max: 260 },
        bpDiastolic: { type: Number, required: true, min: 30, max: 200 },

        // --- Lab fields (clinical) ---
        betaHcg1: { type: Number, required: false }, // i_beta_hcg_miu_ml
        betaHcg2: { type: Number, required: false }, // ii_beta_hcg_miu_ml

        fsh: { type: Number, required: false }, // fsh_miu_ml
        lh: { type: Number, required: false }, // lh_miu_ml
        fshLhRatio: { type: Number, required: false }, // fsh_lh

        tsh: { type: Number, required: false }, // tsh_miu_l
        amh: { type: Number, required: false }, // amh_ng_ml
        prolactin: { type: Number, required: false }, // prl_ng_ml
        vitaminD3: { type: Number, required: false }, // vit_d3_ng_ml
        progesterone: { type: Number, required: false }, // prg_ng_ml
        rbs: { type: Number, required: false }, // rbs_mg_dl

        // modelOutput
        modelOutput: {
            probability: Number,
            riskLevel: String,
            topFactors: Array,
            narration: String,
        },
    },
    { timestamps: true }
);

const ClinicalDataTest = mongoose.model("ClinicalDataTest", ClinicalDataTestSchema);

module.exports = ClinicalDataTest;
