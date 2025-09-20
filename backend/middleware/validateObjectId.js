const mongoose = require("mongoose");

function validateObjectId(req, res, next) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    next(); // pass control to next middleware or controller
}

module.exports = validateObjectId;
