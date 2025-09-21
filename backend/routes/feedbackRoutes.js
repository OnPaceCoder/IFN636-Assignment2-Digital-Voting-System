const express = require("express");
const router = express.Router();
const { addFeedback, getAllFeedback } = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");

// User can submit feedback
router.post("/", loggerMiddleware, authMiddleware, addFeedback);

// Admin can view all feedback
router.get("/", loggerMiddleware, authMiddleware, getAllFeedback);

module.exports = router;