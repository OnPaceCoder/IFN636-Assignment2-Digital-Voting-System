class Vote {
    constructor(voterId, candidateId, electionId) {
        this.voterId = voterId;
        this.candidateId = candidateId;
        this.electionId = electionId;
        this.timestamp = new Date(); // Encapsulation
    }

    getDetails() {
        return {
            voterId: this.voterId,
            candidateId: this.candidateId,
            electionId: this.electionId,
            timestamp: this.timestamp
        };
    }
}

module.exports = Vote;
