const CandidateModel = require("../models/CandidateSchema");
const ElectionModel = require("../models/ElectionSchema");
const VoteModel = require("../models/VoteSchema");
const UserModel = require("../models/UserSchema");
const {
    SortByVote,
    SortByName,
    ResultCalculator,
    SortByNewestCandidate
} = require("../patterns/Strategy");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

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

// Export Election Results (CSV, PDF)

exports.exportResults = async (req, res) => {
    try {
        const { electionId, method, type } = req.query;

        if (!electionId) {
            return res.status(400).json({ error: "Election ID is required" });
        }

        // Fetch candidates
        const candidates = await CandidateModel.find({ electionId });
        if (!candidates.length) {
            return res.status(404).json({ error: "No candidates found for this election" });
        }

        // Strategy Pattern
        const calculator = new ResultCalculator();
        switch (method) {
            case "name":
                calculator.setStrategy(new SortByName());
                break;
            case "latest":
                calculator.setStrategy(new SortByNewestCandidate());
                break;
            default:
                calculator.setStrategy(new SortByVote());
        }
        const results = calculator.getResults(candidates);

        // Export format handling

        // CSV Export
        if (type === "csv") {
            const fields = ["name", "position", "voteCount", "createdAt"];
            const parser = new Parser({ fields });
            const csv = parser.parse(results);

            res.header("Content-Type", "text/csv");
            res.attachment(`results_${electionId}.csv`);
            return res.send(csv);
        }

        // PDF Export
        if (type === "pdf") {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=results_${electionId}.pdf`);

            const doc = new PDFDocument();
            doc.pipe(res);

            doc.fontSize(18).text(`Election Results (${electionId})`, { underline: true });
            doc.moveDown();

            results.forEach((c, index) => {
                doc.fontSize(12).text(
                    `${index + 1}. ${c.name} | Position: ${c.position} | Votes: ${c.voteCount} | Created: ${c.createdAt}`
                );
            });

            doc.end();
            return;
        }

        // Default = JSON
        res.json({ electionId, method: method || "vote", results });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Get Voting Statistics for an Election
exports.getVoteStats = async (req, res) => {
    try {
        const { electionId } = req.query;

        if (!electionId) {
            return res.status(400).json({ error: "Election ID is required" });
        }

        // Confirm election exists
        const election = await ElectionModel.findById(electionId);
        if (!election) {
            return res.status(404).json({ error: "Election not found" });
        }

        // Total votes cast in this election
        const totalVotesCast = await VoteModel.countDocuments({ electionId });

        // Eligible voters = all users
        const eligibleVoters = await UserModel.countDocuments();

        // Turnout
        const turnout = eligibleVoters > 0
            ? ((totalVotesCast / eligibleVoters) * 100).toFixed(2)
            : 0;

        res.json({
            electionId,
            eligibleVoters,
            totalVotesCast,
            turnoutPercentage: turnout
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Historical Results for Past Elections

exports.getAllElectionResults = async (req, res) => {
    try {
        // Get all elections (past and present  )
        const elections = await ElectionModel.find().lean();

        const results = [];

        for (const election of elections) {
            // Fetch candidates for this election
            const candidates = await CandidateModel.find({ electionId: election._id }).lean();

            let winner = null;
            if (candidates.length > 0) {
                // Find candidate with highest voteCount
                winner = candidates.reduce((max, c) =>
                    c.voteCount > max.voteCount ? c : max
                );
            }

            results.push({
                electionId: election._id,
                name: election.name,
                description: election.description,
                winner: winner
                    ? {
                        candidateId: winner._id,
                        name: winner.name,
                        voteCount: winner.voteCount
                    }
                    : null
            });
        }

        res.json({ results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
