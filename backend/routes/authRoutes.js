// routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController.js");
const validateRegister = require("../middleware/validateRegister");
const loggerMiddleware = require("../middleware/loggerMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Request pipeline: logger → validation → controller
router.post("/register", loggerMiddleware, validateRegister, register);

// Request pipeline: logger → controller
router.post("/login", loggerMiddleware, login);

// Protected route: logger → auth → controller
router.get("/profile", loggerMiddleware, authMiddleware, (req, res) => {
    res.json({ message: `Welcome ${req.user.role}` });
});

module.exports = router;
