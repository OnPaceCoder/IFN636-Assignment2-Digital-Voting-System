const express = require("express");
const authFacade = require("../patterns/AuthFacade");
const validateRegister = require("../middleware/validateRegister");
const loggerMiddleware = require("../middleware/loggerMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Routes with Middleware Pattern (Chain of Responsibility)
 *
 * Each middleware has a single responsibility:
 * - loggerMiddleware: logs the request
 * - authMiddleware: checks authentication
 * - validateRegister: validates registration data
 *
 * facade method (e.g., authFacade.register): delegates to the controller and handles subsystem logic
 *
 * The request flows step by step through this chain,
 * and any middleware can stop the chain if its condition fails.
 *
 * Here, instead of calling controllers directly, we call the facade,
 * which provides a single unified entry point to the auth subsystem.
 */

// Request pipeline: logger -> validation -> controller
router.post("/register", loggerMiddleware, validateRegister, (req, res) => authFacade.register(req, res));

// Request pipeline: logger -> controller
router.post("/login", loggerMiddleware, (req, res) => authFacade.login(req, res));

// Protected route: logger -> auth -> controller
router.get("/profile", loggerMiddleware, authMiddleware, (req, res) => authFacade.profile(req, res));

module.exports = router;
