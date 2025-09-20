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

// Admin-only election management
router.post("/", loggerMiddleware, authMiddleware, createElection);
router.put("/toggle", loggerMiddleware, authMiddleware, toggleElection);
router.get("/", loggerMiddleware, authMiddleware, getAllElections);
router.delete("/:id", loggerMiddleware, authMiddleware, deleteElection);
module.exports = router;
