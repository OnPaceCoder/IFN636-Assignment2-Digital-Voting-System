const express = require("express");
const router = express.Router();
const { castVote, viewMyVote } = require("../controllers/voteController");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");

// Protected route: only authenticated users can cast votes
router.post("/", loggerMiddleware, authMiddleware, castVote);

router.get("/", loggerMiddleware, authMiddleware, viewMyVote); // View my vote
module.exports = router;
