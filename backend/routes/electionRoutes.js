const express = require("express");
const router = express.Router();
const {
    createElection,
    getAllElections,
    toggleElection,
    deleteElection
} = require("../controllers/electionController");
const authMiddleware = require("../middleware/authMiddleware");
const loggerMiddleware = require("../middleware/loggerMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// Admin-only election management
router.post("/", loggerMiddleware, authMiddleware, createElection);
router.put("/toggle", loggerMiddleware, authMiddleware, toggleElection);
router.get("/", loggerMiddleware, authMiddleware, getAllElections);
// Request pipeline: logger -> auth -> validateObjectId -> controller
router.delete("/:id", loggerMiddleware, authMiddleware, validateObjectId, deleteElection);
module.exports = router;
