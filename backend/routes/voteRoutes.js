const express = require("express");
const router = express.Router();
const voteFacade = require("../patterns/VoteFacade");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");

// Protected route: only authenticated users can cast votes

// Request pipeline: logger -> auth -> facade method
router.post("/", loggerMiddleware, authMiddleware, (req, res) => voteFacade.cast(req, res)); // Cast a vote

// Request pipeline: logger -> auth -> facade method
router.get("/status", loggerMiddleware, authMiddleware, (req, res) => voteFacade.status(req, res)); // Get vote status

// Request pipeline: logger -> auth -> facade method
router.get("/", loggerMiddleware, authMiddleware, (req, res) => voteFacade.view(req, res)); // View my vote

// Request pipeline: logger -> auth -> facade method
router.patch("/", loggerMiddleware, authMiddleware, (req, res) => voteFacade.update(req, res));  // Update my vote

// Request pipeline: logger -> auth -> facade method
router.delete("/", loggerMiddleware, authMiddleware, (req, res) => voteFacade.withdraw(req, res)); // Withdraw my vote

module.exports = router;

