const express = require("express");
const { register, login, getMyProfile } = require("../controllers/authController.js");
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
 * - controller (e.g., register): handles controller logic
 *
 * The request flows step by step through this chain,
 * and any middleware can stop the chain if its condition fails.
 */

// Request pipeline: logger -> validation -> controller
router.post("/register", loggerMiddleware, validateRegister, register);

// Request pipeline: logger -> controller
router.post("/login", loggerMiddleware, login);

// Protected route: logger -> auth -> controller
router.get("/profile", loggerMiddleware, authMiddleware, getMyProfile);

module.exports = router;
