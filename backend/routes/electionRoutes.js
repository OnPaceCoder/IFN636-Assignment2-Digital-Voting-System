const express = require("express");
const router = express.Router();
const {
    createElection,
    addCandidateToElection,
    toggleElection
} = require("../controllers/electionController");
const authMiddleware = require("../middleware/authMiddleware");

// Admin-only election management
router.post("/", authMiddleware, createElection);
router.put("/toggle", authMiddleware, toggleElection);

module.exports = router;
