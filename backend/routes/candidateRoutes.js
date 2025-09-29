const express = require("express");
const router = express.Router();
const candidateFacade = require("../patterns/CandidateFacade");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

/**
 * Routes with Middleware Pattern (Chain of Responsibility) + Facade Pattern
 *
 * Each middleware has a single responsibility:
 * - loggerMiddleware: logs the request`
 * - authMiddleware: checks authentication
 * - validateObjectId: ensures ID format is valid (for routes with :id)
 *
 * The request flows step by step through this chain
 * and any middleware can stop the chain if its condition fails.
 * 
 * After the middleware chain, the request is handled by:
 * - facade method (e.g., candidateFacade.getById): delegates to the controller
 *   and provides a single unified entry point to the candidate subsystem.
 *
 */

// Admin-only routes
// Request pipeline: logger -> auth -> facade method
router.post("/", loggerMiddleware, authMiddleware, (req, res) => candidateFacade.add(req, res)); // Add new candidate

// Request pipeline: logger -> auth -> facade method
router.get("/", loggerMiddleware, authMiddleware, (req, res) => candidateFacade.getAll(req, res)); // Get all candidates

// Request pipeline: logger -> auth -> validateObjectId -> facade method
router.get("/:id", loggerMiddleware, authMiddleware, validateObjectId, (req, res) => candidateFacade.getById(req, res)); // Get candidate by ID

// Request pipeline: logger -> auth -> validateObjectId -> facade method
router.put("/:id", loggerMiddleware, authMiddleware, validateObjectId, (req, res) => candidateFacade.update(req, res)); // Update candidate

// Request pipeline: logger -> auth -> validateObjectId -> facade method
router.delete("/:id", loggerMiddleware, authMiddleware, validateObjectId, (req, res) => candidateFacade.remove(req, res)); // Delete candidate

module.exports = router;
