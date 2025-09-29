const express = require("express");
const router = express.Router();
const electionFacade = require("../patterns/ElectionFacade");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

/**
 * Routes with Middleware Pattern (Chain of Responsibility) + Facade Pattern
 *
 * Each middleware has a single responsibility:
 * - loggerMiddleware: logs the request
 * - authMiddleware: checks authentication
 * - validateObjectId: ensures ID format is valid (for routes with :id)
 *
 * After the middleware chain, the request is handled by:
 * - facade method: delegates to the controller
 *   and provides a single unified entry point to the election subsystem.
 */

// Admin-only election management
// Request pipeline: logger -> auth -> facade method
router.post("/", loggerMiddleware, authMiddleware, (req, res) => electionFacade.create(req, res));

// Request pipeline: logger -> auth -> facade method
router.put("/toggle", loggerMiddleware, authMiddleware, (req, res) => electionFacade.toggle(req, res));

// Request pipeline: logger -> auth -> facade method
router.get("/", loggerMiddleware, authMiddleware, (req, res) => electionFacade.getAll(req, res));

// Request pipeline: logger -> auth -> validateObjectId -> facade method
router.delete("/:id", loggerMiddleware, authMiddleware, validateObjectId, (req, res) => electionFacade.remove(req, res));

module.exports = router;
