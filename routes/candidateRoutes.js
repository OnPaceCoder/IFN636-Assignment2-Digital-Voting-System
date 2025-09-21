const express = require("express");
const router = express.Router();
const { addCandidate, getAllCandidates, getCandidateById, updateCandidate } = require("../controllers/candidateController");
const authMiddleware = require("../middleware/authMiddleware"); // JWT middleware
const loggerMiddleware = require("../middleware/loggerMiddleware");

// Admin-only routes
router.post("/", loggerMiddleware, authMiddleware, addCandidate);        // Add new candidate
router.get("/", loggerMiddleware, authMiddleware, getAllCandidates); // Get all candidates
router.get("/:id", loggerMiddleware, authMiddleware, getCandidateById); // Get all candidates
router.put("/:id", loggerMiddleware, authMiddleware, updateCandidate);  //Update candidate

module.exports = router;
