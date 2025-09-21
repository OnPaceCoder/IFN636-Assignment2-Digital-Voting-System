const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
