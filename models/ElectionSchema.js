const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        isOpen: { type: Boolean, default: true },
        candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);
