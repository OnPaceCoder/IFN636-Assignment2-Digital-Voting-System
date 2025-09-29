const express = require("express");
const router = express.Router();
const feedbackFacade = require("../patterns/FeedbackFacade");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");

/**
 * Routes with Middleware Pattern (Chain of Responsibility) + Facade Pattern
 *
 * Each middleware has a single responsibility:
 * - loggerMiddleware: logs the request
 * - authMiddleware: checks authentication
 *
 * After the middleware chain, the request is handled by:
 * - facade method: delegates to the controller
 *   and provides a single unified entry point to the feedback subsystem.
 */

// User can submit feedback
// Request pipeline: logger -> auth -> facade method
router.post("/", loggerMiddleware, authMiddleware, (req, res) => feedbackFacade.add(req, res));

// Admin can view all feedback
// Request pipeline: logger -> auth -> facade method
router.get("/", loggerMiddleware, authMiddleware, (req, res) => feedbackFacade.getAll(req, res));

// Admin can delete feedback by ID
// Request pipeline: logger -> auth -> facade method
router.delete("/:id", loggerMiddleware, authMiddleware, (req, res) => feedbackFacade.remove(req, res));

// User can view their own feedback 
// Request pipeline: logger -> auth -> facade method
router.get("/my/:userId", loggerMiddleware, authMiddleware, (req, res) => feedbackFacade.getByUser(req, res));

module.exports = router;
