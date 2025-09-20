const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
    {
        voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
        electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
        timestamp: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

// One voter: one vote per election
voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);
