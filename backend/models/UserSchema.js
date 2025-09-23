const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    hasVoted: { type: Boolean, default: false },
    university: { type: String, default: "Queensland University of Technology" }
});

module.exports = mongoose.model("User", userSchema);
