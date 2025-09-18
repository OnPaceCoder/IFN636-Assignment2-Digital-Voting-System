const ElectionModel = require("../models/ElectionSchema");
const CandidateModel = require("../models/CandidateSchema");
const { Admin } = require("../models/User");
const { AdminProxy } = require("./authController");


// Create new election (Admin only)
exports.createElection = async (req, res) => {
    try {
        const { title, description } = req.body;
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");
        const proxy = new AdminProxy(currentUser);

        const result = await proxy.performAdminAction(async () => {
            const election = new ElectionModel({ title, description });
            await election.save();
            return election;
        });

        res.status(201).json({ message: "Election created", election: result });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};


// Open / Close election (Admin only)
exports.toggleElection = async (req, res) => {
    try {
        const { electionId, isOpen } = req.body;
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");
        const proxy = new AdminProxy(currentUser);

        const result = await proxy.performAdminAction(async () => {
            const election = await ElectionModel.findByIdAndUpdate(
                electionId,
                { isOpen },
                { new: true }
            );
            if (!election) throw new Error("Election not found");
            return election;
        });

        res.json({
            message: `Election ${result.isOpen ? "opened" : "closed"}`,
            election: result
        });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};
