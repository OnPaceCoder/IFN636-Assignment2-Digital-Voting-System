const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const { expect } = chai;

const { castVote } = require("../controllers/voteController");
const ElectionModel = require("../models/ElectionSchema");
const CandidateModel = require("../models/CandidateSchema");
const VoteModel = require("../models/VoteSchema");
const VoteSubject = require("../patterns/VoteSubject");

// Mock Express response object
function mockResponse() {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
}

// CastVote Tests
describe("castVote Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        req = {
            body: { candidateId: "cand123", electionId: "elec123" },
            user: { id: "user123", name: "Test User" }
        };

        sinon.stub(ElectionModel, "findById");
        sinon.stub(CandidateModel, "findByIdAndUpdate");
        sinon.stub(VoteModel, "findOne");
        sinon.stub(VoteModel.prototype, "save");
        sinon.stub(VoteSubject, "notifyObservers");
    });

    afterEach(() => {
        sinon.restore();
    });

    // T025 - Missing fields
    it("T025: returns 400 if candidateId or electionId is missing", async () => {
        req.body = {};

        await castVote(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ error: "CandidateId and ElectionId are required" })).to.be.true;
    });

    // T026 - Candidate does not belong to election
    it("T026: returns 404 if candidate does not belong to the election", async () => {
        const mockElection = {
            _id: "elec123",
            isOpen: true,
            candidates: [{ _id: new mongoose.Types.ObjectId(), name: "Candidate A" }]
        };

        ElectionModel.findById.returns({ populate: sinon.stub().resolves(mockElection) });
        VoteModel.findOne.resolves(null);

        await castVote(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ error: "Candidate does not belong to this election" })).to.be.true;
    });

    // T027 - Successful vote
    it("T027: returns 201 when vote is successfully cast", async () => {
        const candidateId = new mongoose.Types.ObjectId();
        req.body = { candidateId: candidateId.toString(), electionId: "elec123" };

        const mockElection = {
            _id: "elec123",
            isOpen: true,
            candidates: [{ _id: candidateId, name: "Candidate A", voteCount: 0 }]
        };

        ElectionModel.findById.returns({ populate: sinon.stub().resolves(mockElection) });
        VoteModel.findOne.resolves(null);
        CandidateModel.findByIdAndUpdate.resolves();
        VoteModel.prototype.save.resolves();

        await castVote(req, res);

        expect(res.status.calledWith(201)).to.be.true;
        const response = res.json.firstCall.args[0];
        expect(response.message).to.equal("Vote successfully cast");
        expect(response.candidate.voteCount).to.equal(1);
        expect(response.vote.voterId).to.equal("user123");
        expect(VoteSubject.notifyObservers.calledOnce).to.be.true;
    });
});

