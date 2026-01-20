const mongoose = require("mongoose");

const ImageTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },

    originalName: String,
    mimeType: String,
    size: Number,

    modelOutput: mongoose.Schema.Types.Mixed, // stores ML response
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImageTest", ImageTestSchema);
