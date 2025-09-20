const express = require("express");
const router = express.Router();
const { addCandidate, getAllCandidates, getCandidateById, updateCandidate, deleteCandidate } = require("../controllers/candidateController");
const authMiddleware = require("../middleware/authMiddleware"); // JWT middleware
const loggerMiddleware = require("../middleware/loggerMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

/**
 * Routes with Middleware Pattern (Chain of Responsibility)
 *
 * Each middleware has a single responsibility:
 * - loggerMiddleware: logs the request
 * - authMiddleware: checks authentication
 * - validateObjectId: ensures ID format is valid
 * - controller (e.g., getCandidateById): handles business logic
 *
 * The request flows step by step through this chain,
 * and any middleware can stop the chain if its condition fails.
 */


// Admin-only routes
router.post("/", loggerMiddleware, authMiddleware, addCandidate);        // Add new candidate
router.get("/", loggerMiddleware, authMiddleware, getAllCandidates); // Get all candidates
// Request pipeline: logger -> auth -> validateObjectId -> controller
router.get("/:id", loggerMiddleware, authMiddleware, validateObjectId, getCandidateById); // Get all candidates
// Request pipeline: logger -> auth -> validateObjectId -> controller
router.put("/:id", loggerMiddleware, authMiddleware, validateObjectId, updateCandidate); // Update candidate 
// Request pipeline: logger -> auth -> validateObjectId -> controller
router.delete("/:id", loggerMiddleware, authMiddleware, validateObjectId, deleteCandidate); // Delete candidate

module.exports = router;
