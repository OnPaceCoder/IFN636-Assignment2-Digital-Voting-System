const CandidateModel = require("../models/CandidateSchema");
const {
    SortByVote,
    SortByName,
    ResultCalculator,
    SortByNewestCandidate
} = require("../patterns/Strategy");

// View Election Results
exports.viewResults = async (req, res) => {
    try {
        const { electionId, method } = req.query;

        if (!electionId) {
            return res.status(400).json({ error: "Election ID is required" });
        }
        // Fetch candidates for the election
        const candidates = await CandidateModel.find({ electionId });
        if (!candidates.length) {
            return res.status(404).json({ error: "No candidates found for this election" });
        }
        // Strategy Pattern to sort results
        const calculator = new ResultCalculator();

        switch (method) {
            case "name":
                calculator.setStrategy(new SortByName());
                break;
            case "latest":
                calculator.setStrategy(new SortByNewestCandidate());
                break;
            default:
                calculator.setStrategy(new SortByVote()); // default strategy
        }
        // Get sorted results
        const results = calculator.getResults(candidates);

        res.json({
            electionId,
            method: method || "vote",
            results
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
