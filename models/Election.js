class Election {
    constructor(id, title, description, isOpen = true) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isOpen = isOpen;
        this.candidates = []; // list of Candidate objects
    }

    addCandidate(candidate) {
        if (!this.isOpen) throw new Error("Cannot add candidate to a closed election");
        this.candidates.push(candidate);
    }

    openElection() {
        this.isOpen = true;
    }

    closeElection() {
        this.isOpen = false;
    }

    getDetails() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            isOpen: this.isOpen,
            candidates: this.candidates.map(c => c.getDetails())
        };
    }
}

module.exports = Election;
