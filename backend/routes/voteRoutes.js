const express = require("express");
const router = express.Router();
const { castVote } = require("../controllers/voteController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/vote
router.post("/", authMiddleware, castVote);

module.exports = router;
