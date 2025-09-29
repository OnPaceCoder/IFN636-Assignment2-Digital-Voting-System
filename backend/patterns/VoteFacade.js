const {
    castVote,
    viewMyVote,
    updateVote,
    withdrawVote,
    getVoteStatus
} = require("../controllers/voteController");

class VoteFacade {
    async cast(req, res) {
        return castVote(req, res);
    }

    async view(req, res) {
        return viewMyVote(req, res);
    }

    async update(req, res) {
        return updateVote(req, res);
    }

    async withdraw(req, res) {
        return withdrawVote(req, res);
    }

    async status(req, res) {
        return getVoteStatus(req, res);
    }
}

module.exports = new VoteFacade();
