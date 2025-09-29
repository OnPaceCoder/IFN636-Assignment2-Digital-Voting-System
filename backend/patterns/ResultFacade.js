const { viewResults, exportResults, getVoteStats, getAllElectionResults } = require("../controllers/resultController");

class ResultFacade {
    async getResults(req, res) {
        return viewResults(req, res);
    }

    async export(req, res) {
        return exportResults(req, res);
    }

    async stats(req, res) {
        return getVoteStats(req, res);
    }

    async history(req, res) {
        return getAllElectionResults(req, res);
    }
}

module.exports = new ResultFacade();
