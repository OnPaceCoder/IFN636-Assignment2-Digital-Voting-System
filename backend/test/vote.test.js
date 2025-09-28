const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const { expect } = chai;

const { castVote, viewMyVote, updateVote, withdrawVote } = require("../controllers/voteController");
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
        req = { body: { candidateId: "cand1", electionId: "elec1" }, user: { id: "user1" } };
        sinon.stub(ElectionModel, "findById");
        sinon.stub(CandidateModel, "findByIdAndUpdate");
        sinon.stub(VoteModel, "findOne");
        sinon.stub(VoteModel.prototype, "save");
        sinon.stub(VoteSubject, "notifyObservers");
    });

    afterEach(() => sinon.restore());

    // T025 - Missing required fields
    it("T025: should returns 400 if required fields are missing", async () => {
        req.body = {};
        await castVote(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    // T026 - Candidate not in election
    it("T026: should returns 404 if candidate not in election", async () => {
        ElectionModel.findById.returns({ populate: () => Promise.resolve({ _id: "elec1", isOpen: true, candidates: [] }) });
        VoteModel.findOne.resolves(null);
        await castVote(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T027 - Successful vote
    it("T027: should returns 201 when vote is successfully cast", async () => {
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
        expect(response.vote.voterId).to.equal("user1");
        expect(VoteSubject.notifyObservers.calledOnce).to.be.true;
    });
});

// View My Votes Tests
describe("viewMyVote Controller", () => {
    let req, res;

    beforeEach(() => {
        req = { user: { id: "user1" } };
        res = mockResponse();
        sinon.stub(VoteModel, "find");
    });

    afterEach(() => sinon.restore());

    // T028 - No votes found
    it("T028: should returns 404 if no votes found", async () => {
        VoteModel.find.returns({ populate: () => ({ populate: () => Promise.resolve([]) }) });
        await viewMyVote(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T029 - Successful votes retrieval
    it("T029: should returns 200 with list of votes", async () => {
        const candidateId = new mongoose.Types.ObjectId();
        const electionId = new mongoose.Types.ObjectId();

        const mockVote = {
            voterId: "user1",
            candidateId: { _id: candidateId, name: "Candidate A" },
            electionId: { _id: electionId, title: "Presidential Election" },
            timestamp: new Date()
        };

        VoteModel.find.returns({
            populate: () => ({
                populate: () => Promise.resolve([mockVote])
            })
        });

        await viewMyVote(req, res);

        expect(res.status.calledWith(200)).to.be.true;
    });

    // T030 - Database error
    it("T030: should returns 500 if DB error occurs", async () => {
        VoteModel.find.throws(new Error("DB error"));
        await viewMyVote(req, res);
        expect(res.status.calledWith(500)).to.be.true;
    });
});

// UpdateVote Tests
describe("updateVote Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        req = { body: {}, user: { id: "user1" } };
        sinon.stub(VoteModel, "findOne");
        sinon.stub(ElectionModel, "findById");
        sinon.stub(CandidateModel, "findById");
        sinon.stub(CandidateModel, "findByIdAndUpdate");
    });

    afterEach(() => sinon.restore());

    // T031 - Missing fields
    it("T031: should returns 400 if fields missing", async () => {
        await updateVote(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    // T032 - No existing vote
    it("T032: should returns 404 if no existing vote", async () => {
        req.body = { newCandidateId: "cand1", electionId: "elec1" };
        VoteModel.findOne.resolves(null);
        await updateVote(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T033 - Successful update
    it("T033: should returns 200 on successful update", async () => {
        const oldId = new mongoose.Types.ObjectId();
        const newId = new mongoose.Types.ObjectId();
        VoteModel.findOne.resolves({ candidateId: oldId, electionId: "elec1", save: sinon.stub().resolves() });
        ElectionModel.findById.returns({ populate: () => Promise.resolve({ isOpen: true, candidates: [{ _id: newId, voteCount: 0 }] }) });
        CandidateModel.findById.resolves({ _id: oldId, voteCount: 1 });
        CandidateModel.findByIdAndUpdate.resolves();
        req.body = { newCandidateId: newId.toString(), electionId: "elec1" };
        await updateVote(req, res);
        expect(res.status.calledWith(200)).to.be.true;
    });
});

// WithdrawVote Tests
describe("withdrawVote Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        req = { body: {}, user: { id: "user1" } };
        sinon.stub(VoteModel, "findOne");
        sinon.stub(CandidateModel, "findById");
        sinon.stub(CandidateModel, "findByIdAndUpdate");
    });

    afterEach(() => sinon.restore());

    // T034 - Missing electionId
    it("T034: should returns 400 if electionId missing", async () => {
        await withdrawVote(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    // T035 - No existing vote
    it("T035: should returns 404 if no vote found", async () => {
        req.body = { electionId: "elec1" };
        VoteModel.findOne.resolves(null);
        await withdrawVote(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T036 - Successful withdrawal
    it("T036: should returns 200 on successful withdrawal", async () => {
        const candId = new mongoose.Types.ObjectId();
        VoteModel.findOne.resolves({ candidateId: candId, deleteOne: sinon.stub().resolves() });
        CandidateModel.findById.resolves({ _id: candId, voteCount: 1 });
        CandidateModel.findByIdAndUpdate.resolves();
        req.body = { electionId: "elec1" };
        await withdrawVote(req, res);
        expect(res.status.calledWith(200)).to.be.true;
    });
});
