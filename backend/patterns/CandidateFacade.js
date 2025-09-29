const {
    addCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate
} = require("../controllers/candidateController");

class CandidateFacade {
    async add(req, res) {
        return addCandidate(req, res);
    }

    async getAll(req, res) {
        return getAllCandidates(req, res);
    }

    async getById(req, res) {
        return getCandidateById(req, res);
    }

    async update(req, res) {
        return updateCandidate(req, res);
    }

    async remove(req, res) {
        return deleteCandidate(req, res);
    }
}

module.exports = new CandidateFacade();
