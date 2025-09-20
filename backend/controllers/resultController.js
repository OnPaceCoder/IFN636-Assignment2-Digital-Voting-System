const CandidateModel = require("../models/CandidateSchema");
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