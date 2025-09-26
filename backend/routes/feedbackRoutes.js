const express = require("express");
const router = express.Router();
const { addFeedback, getAllFeedback, deleteFeedback, getFeedbackByUser } = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");

// User can submit feedback
router.post("/", loggerMiddleware, authMiddleware, addFeedback);

// Admin can view all feedback
router.get("/", loggerMiddleware, authMiddleware, getAllFeedback);

// Admin can delete feedback by ID
router.delete("/:id", loggerMiddleware, authMiddleware, deleteFeedback);

// User can view their own feedback 
router.get("/my/:userId", loggerMiddleware, authMiddleware, getFeedbackByUser);
module.exports = router;