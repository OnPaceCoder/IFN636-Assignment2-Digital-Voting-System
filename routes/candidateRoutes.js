const express = require("express");
const router = express.Router();
const { addCandidate } = require("../controllers/candidateController");
const authMiddleware = require("../middleware/authMiddleware"); // JWT middleware
const loggerMiddleware = require("../middleware/loggerMiddleware");

// Admin-only routes
router.post("/", loggerMiddleware, authMiddleware, addCandidate);        // Add new candidate


module.exports = router;
