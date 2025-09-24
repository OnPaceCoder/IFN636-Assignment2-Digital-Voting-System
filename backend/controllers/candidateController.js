const CandidateModel = require("../models/CandidateSchema");
const ElectionModel = require("../models/ElectionSchema");
const Candidate = require("../models/Candidate");
const { AdminProxy } = require("./authController"); // import your AdminProxy
const { Admin } = require("../models/User"); // OOP class

// Add Candidate (Admin Only)
const addCandidate = async (req, res) => {
    try {
        // Extract candidate details from request body
        const { name, position, manifesto, photoUrl, electionId } = req.body;
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");

        // Wrap in Proxy
        const proxy = new AdminProxy(currentUser);

        const electionDoc = await ElectionModel.findById(electionId);
        if (!electionDoc) throw new Error("Election not found");

        const result = await proxy.performAdminAction(async () => {
            // OOP Candidate object
            const candidateObj = new Candidate(Date.now(), name, position, manifesto, photoUrl);

            // Save candidate in DB
            const candidateDoc = new CandidateModel({
                name: candidateObj.name,
                position: candidateObj.position,
                manifesto: candidateObj.manifesto,
                photoUrl: candidateObj.photoUrl,
                status: candidateObj.status,
                voteCount: candidateObj.voteCount,
                electionId
            });
            await candidateDoc.save();

            // Convert electionDoc into OOP Election
            const Election = require("../models/Election");
            const election = new Election(
                electionDoc._id,
                electionDoc.title,
                electionDoc.description,
                electionDoc.isOpen
            );

            // Use OOP addCandidate()
            election.addCandidate(candidateObj);

            // Sync back to DB
            electionDoc.candidates.push(candidateDoc._id);
            await electionDoc.save();

            return { ...candidateObj.getDetails(), election: election.getDetails() };
        });

        res.status(201).json({
            message: "Candidate added successfully",
            candidate: result
        });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};

const getAllCandidates = async (req, res) => {
    try {
        const { q = "", status = "", page = 1, limit = 10, electionId } = req.query;
        const filter = {};

        // Voters only see active candidates
        if (!req.user?.isAdmin) {
            filter.status = "active";
        }

        // Search by name/position
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { position: { $regex: q, $options: "i" } }
            ];
        }

        // Election filter
        if (electionId) {
            filter.electionId = electionId;
        }

        // Status filter (Admins can query all, Voters restricted above)
        if (status && req.user?.isAdmin) {
            filter.status = status;
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        const skip = (pageNum - 1) * limitNum;

        const [items, total] = await Promise.all([
            CandidateModel.find(filter).sort("-createdAt").skip(skip).limit(limitNum),
            CandidateModel.countDocuments(filter)
        ]);

        res.status(200).json({
            items,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
        });
    } catch (err) {
        console.error("getCandidates error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get candidate from DB
        const candidateDoc = await CandidateModel.findById(id);
        if (!candidateDoc) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Wrap DB doc in OOP class
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

        // Restrict voters from seeing withdrawn candidates
        if (!req.user?.isAdmin && candidateDoc.status !== "active") {
            return res.status(403).json({ message: "Not authorized to view this candidate" });
        }

        // Response
        res.status(200).json({
            id: candidate.id,
            name: candidate.name,
            manifesto: candidate.manifesto,
            votes: candidateDoc.voteCount,
            status: candidateDoc.status,
            electionId: candidate.electionId
        });
    } catch (err) {
        console.error("getCandidateById error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};



// Update Candidate (Admin Only)
const updateCandidate = async (req, res) => {
    try {
        const { id } = req.params; // candidate id
        const { name, position, manifesto, photoUrl, status, electionId } = req.body;

        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");
        const proxy = new AdminProxy(currentUser);

        const candidateDoc = await CandidateModel.findById(id);
        if (!candidateDoc) throw new Error("Candidate not found");

        const result = await proxy.performAdminAction(async () => {
            // Update candidate fields
            if (name) candidateDoc.name = name;
            if (position) candidateDoc.position = position;
            if (manifesto) candidateDoc.manifesto = manifesto;
            if (photoUrl) candidateDoc.photoUrl = photoUrl;
            if (status) candidateDoc.status = status;
            if (electionId) candidateDoc.electionId = electionId;

            await candidateDoc.save();

            // Wrap into OOP Candidate
            const candidateObj = new Candidate(
                candidateDoc._id,
                candidateDoc.name,
                candidateDoc.position,
                candidateDoc.manifesto,
                candidateDoc.photoUrl,
                candidateDoc.status,
                candidateDoc.voteCount,
                candidateDoc.electionId
            );

            return candidateObj.getDetails();
        });

        res.status(200).json({
            message: "Candidate updated successfully",
            candidate: result
        });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};

// Delete Candidate (Admin Only)

const deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params; // candidate id

        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");

        // Wrap in Proxy
        const proxy = new AdminProxy(currentUser);

        const candidateDoc = await CandidateModel.findById(id);
        if (!candidateDoc) throw new Error("Candidate not found");

        const result = await proxy.performAdminAction(async () => {
            // Remove candidate from DB
            await CandidateModel.findByIdAndDelete(id);

            // Remove from related Elections
            await ElectionModel.updateOne(
                { _id: candidateDoc.electionId },
                { $pull: { candidates: candidateDoc._id } }
            );

            return { id, message: "Candidate deleted" };
        });

        res.status(200).json({
            message: "Candidate deleted successfully",
            result
        });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};


module.exports = { addCandidate, getAllCandidates, getCandidateById, updateCandidate, deleteCandidate };