const Feedback = require("../models/FeedbackSchema");
const { Admin } = require("../models/User");
const { AdminProxy } = require("./authController");

// POST /feedback (user)
exports.addFeedback = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: "Feedback message is required" });
        }

        const feedback = await Feedback.create({
            userId: req.user.id,
            message: message.trim()
        });

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /feedback (admin)
exports.getAllFeedback = async (req, res) => {
    try {

        // Ensure only admin can access
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");
        const proxy = new AdminProxy(currentUser);

        // Use proxy to perform admin action
        const feedbacks = await proxy.performAdminAction(async () => {
            return await Feedback.find().populate("userId", "name email");
        });


        res.status(200).json({
            count: feedbacks.length,
            feedbacks
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /feedback/:id (admin)
exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure only admin can access
        const currentUser = new Admin(req.user.id, req.user.name, req.user.email, "");
        const proxy = new AdminProxy(currentUser);

        const result = await proxy.performAdminAction(async () => {
            const feedback = await Feedback.findByIdAndDelete(id);
            if (!feedback) throw new Error("Feedback not found");
            return feedback;
        });

        res.status(200).json({
            message: "Feedback deleted successfully",
            feedback: result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
