const {
    addFeedback,
    getAllFeedback,
    deleteFeedback,
    getFeedbackByUser
} = require("../controllers/feedbackController");

class FeedbackFacade {
    async add(req, res) {
        return addFeedback(req, res);
    }

    async getAll(req, res) {
        return getAllFeedback(req, res);
    }

    async remove(req, res) {
        return deleteFeedback(req, res);
    }

    async getByUser(req, res) {
        return getFeedbackByUser(req, res);
    }
}

module.exports = new FeedbackFacade();
