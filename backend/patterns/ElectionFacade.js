const {
    createElection,
    getAllElections,
    toggleElection,
    deleteElection
} = require("../controllers/electionController");

class ElectionFacade {
    async create(req, res) {
        return createElection(req, res);
    }

    async getAll(req, res) {
        return getAllElections(req, res);
    }

    async toggle(req, res) {
        return toggleElection(req, res);
    }

    async remove(req, res) {
        return deleteElection(req, res);
    }
}

module.exports = new ElectionFacade();
