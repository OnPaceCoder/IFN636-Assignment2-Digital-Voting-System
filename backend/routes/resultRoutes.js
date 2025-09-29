const express = require("express");
const router = express.Router();
const loggerMiddleware = require("../middleware/loggerMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const resultFacade = require("../patterns/ResultFacade");

// Protected route: only authenticated users can view results

// Request pipeline: logger -> auth -> facade method
router.get("/", loggerMiddleware, authMiddleware, (req, res) => resultFacade.getResults(req, res)); // View results

// Request pipeline: logger -> auth -> facade method
router.post("/export", loggerMiddleware, authMiddleware, (req, res) => resultFacade.export(req, res)); // Export results

// Request pipeline: logger -> auth -> facade method
router.get("/stats", loggerMiddleware, authMiddleware, (req, res) => resultFacade.stats(req, res)); // Get voting statistics

// Request pipeline: logger -> auth -> facade method
router.get("/history", loggerMiddleware, authMiddleware, (req, res) => resultFacade.history(req, res)); // Get all election results

module.exports = router;
