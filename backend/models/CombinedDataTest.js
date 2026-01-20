const mongoose = require("mongoose");

const CombinedDataTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // stored image
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    originalName: String,
    mimeType: String,
    size: Number,

    // clinical inputs (store all 19 in one object)
    clinical: {
      age_yrs: Number,
      weight_kg: Number,
      height_cm: Number,
      bmi: Number,
      pulse_rate_bpm: Number,
      hb_g_dl: Number,
      cycle_length_days: Number,
      fsh_miu_ml: Number,
      lh_miu_ml: Number,
      fsh_lh: Number,
      hip_inch: Number,
      waist_inch: Number,
      tsh_miu_l: Number,
      amh_ng_ml: Number,
      prl_ng_ml: Number,
      vit_d3_ng_ml: Number,
      follicle_no_l: Number,
      follicle_no_r: Number,
      endometrium_mm: Number,
    },

    modelOutput: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("CombinedDataTest", CombinedDataTestSchema);