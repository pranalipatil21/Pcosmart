const mongoose = require('mongoose');

const SimpleDataTestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        age: { type: Number, required: true, min: 10, max: 70 }, // age_yrs
        bmi: { type: Number, required: true, min: 10, max: 60 },

        pulseRate: { type: Number, required: true, min: 30, max: 220 }, // pulse_rate_bpm
        respiratoryRate: { type: Number, required: true, min: 5, max: 80 }, // rr_breaths_min
        hemoglobin: { type: Number, required: true, min: 1, max: 25 }, // hb_g_dl

        // Your model uses cycle_r_i with values 2 and 4.
        // Store as number (2/4) OR store as string and map later.
        menstrualCycleType: {
            type: Number,
            required: true,
            enum: [2, 4], // 2 = Regular, 4 = Irregular
        },

        averageCycleLength: { type: Number, required: true, min: 1, max: 120 }, // cycle_length_days

        weightGain: { type: Boolean, required: true }, // weight_gain_y_n
        hairGrowth: { type: Boolean, required: true }, // hair_growth_y_n
        skinDarkening: { type: Boolean, required: true }, // skin_darkening_y_n
        hairLoss: { type: Boolean, required: true }, // hair_loss_y_n
        pimples: { type: Boolean, required: true }, // pimples_y_n

        fastFood: { type: Boolean, required: true }, // fast_food_y_n
        regularExercise: { type: Boolean, required: true }, // reg_exercise_y_n

        bpSystolic: { type: Number, required: true, min: 50, max: 260 }, // bp_systolic_mmhg
        bpDiastolic: { type: Number, required: true, min: 30, max: 200 }, // bp_diastolic_mmhg

        // store prediction result when you integrate ML later
        modelOutput: {
            probability: Number,
            riskLevel: String,
            topFactors: Array,
            narration: String,
        },
    },
    { timestamps: true }
);

const SimpleDataTest = mongoose.model("SimpleDataTest", SimpleDataTestSchema);


module.exports = SimpleDataTest;