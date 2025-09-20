class Candidate {
    constructor(id, name, position, manifesto, photoUrl, status = "active") {
        this.id = id;
        this.name = name;
        this.position = position;
        this.manifesto = manifesto;
        this.photoUrl = photoUrl;
        this.status = status;
        this.voteCount = 0; // encapsulated
    }

    addVote() {
        this.voteCount++; // Encapsulation
    }

    withdraw() {
        this.status = "withdrawn"; // Encapsulation
    }

    getDetails() {
        return {
            id: this.id,
            name: this.name,
            position: this.position,
            manifesto: this.manifesto,
            photoUrl: this.photoUrl,
            status: this.status,
            voteCount: this.voteCount
        };
    }
}

module.exports = Candidate;
