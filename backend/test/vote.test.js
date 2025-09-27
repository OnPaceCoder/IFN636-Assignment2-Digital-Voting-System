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

// View My Votes Tests
describe("viewMyVote Controller", () => {
    let req, res;

    beforeEach(() => {
        req = { user: { id: "user123" } };
        res = mockResponse();
        sinon.stub(VoteModel, "find");
    });

    afterEach(() => sinon.restore());

    // T028 - No votes found
    it("T028: returns 404 if no votes found", async () => {
        VoteModel.find.returns({
            populate: () => ({ populate: () => Promise.resolve([]) })
        });

        await viewMyVote(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            message: "No votes found for this user"
        });
    });

    //  T029 - Votes found
    it("T029: returns 200 with votes when found", async () => {
        const candidateId = new mongoose.Types.ObjectId();
        const electionId = new mongoose.Types.ObjectId();

        const mockVote = {
            voterId: "user123",
            candidateId: {
                _id: candidateId,
                name: "Candidate A",
                position: "President",
                manifesto: "Change things",
                photoUrl: "photo.png",
                status: "active",
                voteCount: 5,
                electionId
            },
            electionId: {
                _id: electionId,
                title: "Presidential Election",
                description: "Choose your leader",
                isOpen: true
            },
            timestamp: new Date()
        };

        VoteModel.find.returns({
            populate: () => ({ populate: () => Promise.resolve([mockVote]) })
        });

        await viewMyVote(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        const body = res.json.firstCall.args[0];
        expect(body.message).to.equal("My votes retrieved successfully");
        expect(body.votes).to.have.length(1);
        expect(body.votes[0].candidate.name).to.equal("Candidate A");
        expect(body.votes[0].election.title).to.equal("Presidential Election");
    });

    // T030 - DB or Internal error
    it("T030: returns 500 if DB throws error", async () => {
        VoteModel.find.throws(new Error("Database down"));

        await viewMyVote(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "Database down");
    });
});

// UpdateVote Tests
describe("updateVote Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        req = { body: {}, user: { id: "user123" } };
        sinon.stub(VoteModel, "findOne");
        sinon.stub(ElectionModel, "findById");
        sinon.stub(CandidateModel, "findById");
        sinon.stub(CandidateModel, "findByIdAndUpdate");
    });

    afterEach(() => sinon.restore());

    // T031 - Missing fields
    it("T031: should return 400 if fields are missing", async () => {
        await updateVote(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    // T032 - No existing vote
    it("T032: should return 404 if no existing vote", async () => {
        VoteModel.findOne.resolves(null);
        req.body = { newCandidateId: "cand1", electionId: "elec1" };

        await updateVote(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T033 - Successful update
    it("T033: should return 200 when vote updated successfully", async () => {
        const oldCandidateId = new mongoose.Types.ObjectId();
        const newCandidateId = new mongoose.Types.ObjectId();

        // fake existing vote
        const fakeVote = { candidateId: oldCandidateId, electionId: "elec1", save: sinon.stub().resolves() };
        VoteModel.findOne.resolves(fakeVote);

        // fake election with new candidate
        ElectionModel.findById.returns({ populate: () => Promise.resolve({ isOpen: true, candidates: [{ _id: newCandidateId, name: "New C", voteCount: 0 }] }) });

        // fake old candidate
        CandidateModel.findById.resolves({ _id: oldCandidateId, name: "Old C", voteCount: 1, removeVote: () => { } });
        CandidateModel.findByIdAndUpdate.resolves();

        req.body = { newCandidateId: newCandidateId.toString(), electionId: "elec1" };

        await updateVote(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("message", "Vote successfully updated");
    });
});

// WithdrawVote Tests
describe("withdrawVote Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        req = { body: {}, user: { id: "user123" } };
        sinon.stub(VoteModel, "findOne");
        sinon.stub(CandidateModel, "findById");
        sinon.stub(CandidateModel, "findByIdAndUpdate");
    });

    afterEach(() => sinon.restore());

    // T034 - Missing fields
    it("T034: should return 400 if electionId missing", async () => {
        await withdrawVote(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    // T035 - No existing vote
    it("T035: should return 404 if no vote found", async () => {
        req.body = { electionId: "elec1" };
        VoteModel.findOne.resolves(null);

        await withdrawVote(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T036 - Successful withdrawal
    it("T036: should return 200 when vote withdrawn", async () => {
        const candidateId = new mongoose.Types.ObjectId();

        // fake vote
        const fakeVote = { candidateId, deleteOne: sinon.stub().resolves() };
        VoteModel.findOne.resolves(fakeVote);

        // fake candidate
        CandidateModel.findById.resolves({ _id: candidateId, name: "C", voteCount: 1, removeVote: () => { } });
        CandidateModel.findByIdAndUpdate.resolves();

        req.body = { electionId: "elec1" };

        await withdrawVote(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("message", "Vote successfully withdrawn");
    });
});