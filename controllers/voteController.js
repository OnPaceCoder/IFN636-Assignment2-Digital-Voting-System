const VoteModel = require("../models/VoteSchema");
const CandidateModel = require("../models/CandidateSchema");
const ElectionModel = require("../models/ElectionSchema");
const Candidate = require("../models/Candidate"); // OOP class
const Vote = require("../models/Vote");

exports.castVote = async (req, res) => {
    try {
        const { candidateId, electionId } = req.body;

        const voterId = req.user.id; // from JWT middleware

        // Check election validity
        const election = await ElectionModel.findById(electionId).populate("candidates");
        if (!election) return res.status(404).json({ error: "Election not found" });
        if (!election.isOpen) return res.status(400).json({ error: "Election is closed" });

        //  Ensure candidate belongs to election
        const candidateDoc = election.candidates.find(
            (c) => c._id.toString() === candidateId
        );
        if (!candidateDoc) {
            return res.status(400).json({ error: "Candidate does not belong to this election" });
        }

        //  Prevent duplicate vote in same election
        const existingVote = await VoteModel.findOne({ voterId, electionId });
        if (existingVote) {
            return res.status(400).json({ error: "You already voted in this election" });
        }

        // Use OOP Candidate class to add vote
        const candidateObj = new Candidate(
            candidateDoc._id,
            candidateDoc.name,
            candidateDoc.position,
            candidateDoc.manifesto,
            candidateDoc.photoUrl,
            candidateDoc.status
        );
        candidateObj.voteCount = candidateDoc.voteCount; // sync from DB
        candidateObj.addVote(); // OOP encapsulation

        // Persist candidate vote count in DB
        await CandidateModel.findByIdAndUpdate(candidateId, {
            voteCount: candidateObj.voteCount
        });

        // Create OOP Vote object
        const voteObj = new Vote(voterId, candidateId, electionId);

        // Save vote to DB
        const voteDoc = new VoteModel({
            voterId,
            candidateId,
            electionId,
            timestamp: voteObj.timestamp
        });
        await voteDoc.save();

        res.status(201).json({
            message: "Vote successfully cast",
            candidate: candidateObj.getDetails(),
            vote: voteObj.getDetails()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
