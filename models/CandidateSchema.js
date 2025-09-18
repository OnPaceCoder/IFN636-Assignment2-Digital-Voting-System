const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        position: { type: String, required: true },
        manifesto: { type: String },
        photoUrl: { type: String },
        status: { type: String, enum: ["Active", "Withdrawn"], default: "active" },
        voteCount: { type: Number, default: 0 },
        electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
