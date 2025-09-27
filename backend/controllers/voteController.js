const VoteModel = require("../models/VoteSchema");
const CandidateModel = require("../models/CandidateSchema");
const ElectionModel = require("../models/ElectionSchema");
const Candidate = require("../models/Candidate"); // OOP class
const Vote = require("../models/Vote");
const VoteSubject = require("../patterns/VoteSubject");
const { LogObserver, AdminConsoleObserver } = require("../patterns/Observer");


VoteSubject.addObserver(new LogObserver());
VoteSubject.addObserver(new AdminConsoleObserver());


// Cast Vote Controller
exports.castVote = async (req, res) => {
    try {
        const { candidateId, electionId } = req.body;

        // Check for missing fields
        if (!candidateId || !electionId) {
            return res.status(400).json({ error: "CandidateId and ElectionId are required" })
        }

        const voterId = req.user.id; // from JWT middleware

        // Check election validity
        const election = await ElectionModel.findById(electionId).populate("candidates");
        if (!election) return res.status(404).json({ error: "Election not found" });
        if (!election.isOpen) return res.status(403).json({ error: "Election is closed" });

        //  Ensure candidate belongs to election
        const candidateDoc = election.candidates.find(
            (c) => c._id.toString() === candidateId
        );
        if (!candidateDoc) {
            return res.status(404).json({ error: "Candidate does not belong to this election" });
        }

        //  Prevent duplicate vote in same election
        const existingVote = await VoteModel.findOne({ voterId, electionId });
        if (existingVote) {
            return res.status(409).json({ error: "You already voted in this election" });
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

        // Notify observers
        VoteSubject.notifyObservers({
            voterName: req.user.name,
            candidateName: candidateDoc.name,
        });

        res.status(201).json({
            message: "Vote successfully cast",
            candidate: candidateObj.getDetails(),
            vote: voteObj.getDetails()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View My Vote History
exports.viewMyVote = async (req, res) => {
    try {
        const voterId = req.user.id; // from JWT middleware

        // Find votes for this voter, include candidate + election
        const votes = await VoteModel.find({ voterId })
            .populate("candidateId")
            .populate("electionId");

        if (!votes.length) {
            return res.status(404).json({ message: "No votes found for this user" });
        }

        // Wrap each vote in OOP classes
        const response = votes.map((voteDoc) => {
            const candidateDoc = voteDoc.candidateId;
            const electionDoc = voteDoc.electionId;

            // OOP Candidate
            const candidateObj = new Candidate(
                candidateDoc._id.toString(),
                candidateDoc.name,
                candidateDoc.position,
                candidateDoc.manifesto,
                candidateDoc.photoUrl,
                candidateDoc.status,
                candidateDoc.voteCount,
                candidateDoc.electionId,
            );

            // OOP Vote
            const voteObj = new Vote(
                voteDoc.voterId,
                voteDoc.candidateId._id,
                voteDoc.electionId._id,
                voteDoc.timestamp
            );

            return {
                vote: voteObj.getDetails(),
                candidate: candidateObj.getDetails(),
                election: {
                    id: electionDoc._id.toString(),
                    title: electionDoc.title,
                    description: electionDoc.description,
                    isOpen: electionDoc.isOpen
                }
            };
        });

        res.status(200).json({
            message: "My votes retrieved successfully",
            votes: response
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Vote 
exports.updateVote = async (req, res) => {
    try {
        const { newCandidateId, electionId } = req.body;

        // Check for missing fields
        if (!newCandidateId || !electionId) {
            return res.status(400).json({ error: "newCandidateId and electionId are required" });
        }

        const voterId = req.user.id; // from JWT middleware
        // console.log("Update vote request:", { voterId, electionId, newCandidateId });
        // Finding existing vote
        const existingVote = await VoteModel.findOne({ voterId, electionId });
        if (!existingVote) {
            return res.status(404).json({ error: "No existing vote found for this election" });
        }

        // Get election data
        const election = await ElectionModel.findById(electionId).populate("candidates");
        if (!election) return res.status(404).json({ error: "Election not found" });
        if (!election.isOpen) return res.status(400).json({ error: "Election is closed" });

        // Validate new candidate belongs to election
        const newCandidateDoc = election.candidates.find(
            (c) => c._id.toString() === newCandidateId
        );
        if (!newCandidateDoc) {
            return res.status(400).json({ error: "Candidate does not belong to this election" });
        }

        // Wrap old candidate in OOP and remove vote
        const oldCandidateDoc = await CandidateModel.findById(existingVote.candidateId);
        const oldCandidate = new Candidate(
            oldCandidateDoc._id.toString(),
            oldCandidateDoc.name,
            oldCandidateDoc.position,
            oldCandidateDoc.manifesto,
            oldCandidateDoc.photoUrl,
            oldCandidateDoc.status,
            oldCandidateDoc.voteCount,
            oldCandidateDoc.electionId
        );
        oldCandidate.removeVote();

        // Update old candidate vote count in DB
        await CandidateModel.findByIdAndUpdate(oldCandidate.id, { voteCount: oldCandidate.voteCount });

        // Wrap new candidate in OOP and add vote
        const newCandidate = new Candidate(
            newCandidateDoc._id.toString(),
            newCandidateDoc.name,
            newCandidateDoc.position,
            newCandidateDoc.manifesto,
            newCandidateDoc.photoUrl,
            newCandidateDoc.status,
            newCandidateDoc.voteCount,
            newCandidateDoc.electionId
        );
        newCandidate.addVote();

        // Update new candidate vote count in DB
        await CandidateModel.findByIdAndUpdate(newCandidate.id, { voteCount: newCandidate.voteCount });

        // Update the vote record
        existingVote.candidateId = newCandidateId;
        existingVote.timestamp = new Date();
        await existingVote.save();

        // Wrap in OOP Vote object
        const voteObj = new Vote(
            existingVote.voterId,
            existingVote.candidateId,
            existingVote.electionId,
            existingVote.timestamp
        );

        res.status(200).json({
            message: "Vote successfully updated",
            oldCandidate: oldCandidate.getDetails(),
            newCandidate: newCandidate.getDetails(),
            vote: voteObj.getDetails()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Withdraw Vote 
exports.withdrawVote = async (req, res) => {
    try {
        const { electionId } = req.body;

        //  Check for missing fields
        if (!electionId) {
            return res.status(400).json({ error: "electionId is required" });
        }

        const voterId = req.user.id; // from JWT middleware

        // Find existing vote
        const existingVote = await VoteModel.findOne({ voterId, electionId });
        if (!existingVote) {
            return res.status(404).json({ error: "No vote found to withdraw for this election" });
        }

        // Fetch candidate that was voted
        const candidateDoc = await CandidateModel.findById(existingVote.candidateId);
        if (!candidateDoc) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        // Wrap candidate in OOP and remove vote
        const candidate = new Candidate(
            candidateDoc._id.toString(),
            candidateDoc.name,
            candidateDoc.position,
            candidateDoc.manifesto,
            candidateDoc.photoUrl,
            candidateDoc.status,
            candidateDoc.voteCount,
            candidateDoc.electionId
        );
        candidate.removeVote(); // Using encapsulated method

        // Update candidate vote count in DB
        await CandidateModel.findByIdAndUpdate(candidate.id, { voteCount: candidate.voteCount });

        // Delete the vote record
        await existingVote.deleteOne();

        res.status(200).json({
            message: "Vote successfully withdrawn",
            candidate: candidate.getDetails()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Get vote status for a specific election OR all votes
exports.getVoteStatus = async (req, res) => {
    try {
        const voterId = req.user.id; // from JWT middleware
        const { electionId } = req.query;

        if (electionId) {
            // Case 1: Specific election
            const vote = await VoteModel.findOne({ voterId, electionId }).populate("candidateId");
            if (!vote) {
                return res.json({ hasVoted: false, vote: null });
            }

            return res.json({
                hasVoted: true,
                vote: {
                    _id: vote._id,
                    candidateId: vote.candidateId?._id,
                    candidateName: vote.candidateId?.name,
                    position: vote.candidateId?.position,
                    photoUrl: vote.candidateId?.photoUrl,
                    manifesto: vote.candidateId?.manifesto,
                    when: vote.createdAt
                }
            });
        }

        // Case 2: All elections 
        const votes = await VoteModel.find({ voterId })
            .populate("candidateId")
            .populate("electionId");

        if (!votes.length) {
            return res.json({ hasVoted: false, votes: [] });
        }

        const history = votes.map((voteDoc) => ({
            _id: voteDoc._id,
            candidateId: voteDoc.candidateId?._id,
            candidateName: voteDoc.candidateId?.name,
            position: voteDoc.candidateId?.position,
            photoUrl: voteDoc.candidateId?.photoUrl,
            manifesto: voteDoc.candidateId?.manifesto,
            when: voteDoc.createdAt,
            election: voteDoc.electionId
                ? {
                    id: voteDoc.electionId._id,
                    title: voteDoc.electionId.title,
                    description: voteDoc.electionId.description,
                    isOpen: voteDoc.electionId.isOpen
                }
                : null
        }));

        res.json({
            hasVoted: true,
            votes: history
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
