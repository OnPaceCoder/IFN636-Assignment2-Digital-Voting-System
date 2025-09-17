const CandidateModel = require("../models/CandidateSchema");
const Candidate = require("../models/Candidate");
const { AdminProxy } = require("./authController"); // import your AdminProxy
const { Admin } = require("../models/User"); // OOP class

// Add Candidate (Admin Only)
const addCandidate = async (req, res) => {
    try {
        const { name, position, manifesto, photoUrl } = req.body;
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");
        const proxy = new AdminProxy(currentUser);

        const result = await proxy.performAdminAction(async () => {
            const candidateObj = new Candidate(Date.now(), name, position, manifesto, photoUrl);

            const candidateDoc = new CandidateModel({
                name: candidateObj.name,
                position: candidateObj.position,
                manifesto: candidateObj.manifesto,
                photoUrl: candidateObj.photoUrl,
                status: candidateObj.status,
                voteCount: candidateObj.voteCount
            });

            await candidateDoc.save();
            return candidateObj.getDetails();
        });

        res.status(201).json({
            message: "Candidate added successfully",
            candidate: result
        });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};

module.exports = { addCandidate };