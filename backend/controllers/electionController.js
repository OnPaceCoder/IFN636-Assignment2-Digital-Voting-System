const ElectionModel = require("../models/ElectionSchema");
const CandidateModel = require("../models/CandidateSchema");
const { Admin } = require("../models/User");
const { AdminProxy } = require("./authController");


// Create new election (Admin only)
exports.createElection = async (req, res) => {
    try {
        // Extract election details from request body
        const { title, description } = req.body;
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");

        // Wrap in Proxy
        const proxy = new AdminProxy(currentUser);

        // Perform admin action via proxy
        const result = await proxy.performAdminAction(async () => {
            const election = new ElectionModel({ title, description });
            await election.save();
            return election;
        });

        // Send response
        res.status(201).json({ message: "Election created", election: result });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};


// Update election (Admin only)
exports.toggleElection = async (req, res) => {
    try {

        // Extract electionId and isOpen from request body
        const { electionId, isOpen } = req.body;
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");

        // Wrap in Proxy
        const proxy = new AdminProxy(currentUser);


        // Perform admin action via proxy
        const result = await proxy.performAdminAction(async () => {
            const election = await ElectionModel.findByIdAndUpdate(
                electionId,
                { isOpen },
                { new: true }
            );
            if (!election) throw new Error("Election not found");
            return election;
        });

        // Send response
        res.json({
            message: `Election ${result.isOpen ? "opened" : "closed"}`,
            election: result
        });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};


// Get All Elections (Admin and Regular Users)
exports.getAllElections = async (req, res) => {
    try {
        // Fetch all elections from DB
        const elections = await ElectionModel.find().sort({ createdAt: -1 });

        // If no elections found
        if (!elections || elections.length === 0) {
            return res.status(404).json({ message: "No elections found" });
        }

        // Send response
        res.status(200).json({
            message: "Elections retrieved successfully",
            count: elections.length,
            elections,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Election (Admin only) - Optional
exports.deleteElection = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");

        // Wrap in Proxy
        const proxy = new AdminProxy(currentUser);

        // Perform admin action via proxy
        const result = await proxy.performAdminAction(async () => {
            const election = await ElectionModel.findByIdAndDelete(id);
            if (!election) throw new Error("Election not found");
            return election;
        });
        // Send response
        res.json({ message: "Election deleted", election: result });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
}