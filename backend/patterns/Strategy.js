// Strategy Pattern for sorting election results
class SortByVote {
    sort(candidates) {
        return candidates.sort((a, b) => b.voteCount - a.voteCount);
    }
}

class SortByName {
    sort(candidates) {
        return candidates.sort((a, b) => a.name.localeCompare(b.name));
    }
}

class SortByNewestCandidate {
    sort(candidates) {
        return candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}
class ResultCalculator {
    setStrategy(strategy) {
        this.strategy = strategy;
    }

    getResults(candidates) {
        if (!this.strategy) throw new Error("No strategy selected");
        return this.strategy.sort(candidates);
    }
}

module.exports = { SortByVote, SortByName, SortByNewestCandidate, ResultCalculator };
