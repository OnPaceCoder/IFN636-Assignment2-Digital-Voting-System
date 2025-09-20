const express = require("express");
const router = express.Router();
const { viewResults, exportResults, getVoteStats } = require("../controllers/resultController");
const loggerMiddleware = require("../middleware/loggerMiddleware");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/", loggerMiddleware, authMiddleware, viewResults);
router.post("/export", loggerMiddleware, authMiddleware, exportResults);
router.get("/stats", loggerMiddleware, authMiddleware, getVoteStats);


module.exports = router;
