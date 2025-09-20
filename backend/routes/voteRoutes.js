const express = require("express");
const router = express.Router();
const { castVote, viewMyVote, updateVote, withdrawVote } = require("../controllers/voteController");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");

// Protected route: only authenticated users can cast votes
router.post("/", loggerMiddleware, authMiddleware, castVote);

router.get("/", loggerMiddleware, authMiddleware, viewMyVote); // View my vote
router.patch("/", loggerMiddleware, authMiddleware, updateVote); // Change my vote
router.delete("/", loggerMiddleware, authMiddleware, withdrawVote); // Withdraw my vote
module.exports = router;
