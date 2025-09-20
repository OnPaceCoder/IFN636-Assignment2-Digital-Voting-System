const express = require("express");
const router = express.Router();
const { viewResults, exportResults } = require("../controllers/resultController");
const loggerMiddleware = require("../middleware/loggerMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/result?electionId=123&method=vote|name|position
router.get("/", loggerMiddleware, authMiddleware, viewResults);
router.get("/export", loggerMiddleware, authMiddleware, exportResults);
module.exports = router;
