const express = require("express");
const router = express.Router();
const { viewResults, exportResults, getVoteStats, getAllElectionResults } = require("../controllers/resultController");
const loggerMiddleware = require("../middleware/loggerMiddleware");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/", loggerMiddleware, authMiddleware, viewResults); // View results
router.post("/export", loggerMiddleware, authMiddleware, exportResults); // Export results
router.get("/stats", loggerMiddleware, authMiddleware, getVoteStats); // Get voting statistics
router.get("/history", loggerMiddleware, authMiddleware, getAllElectionResults); // Get all election results

module.exports = router;
