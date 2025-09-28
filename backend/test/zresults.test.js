const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const { expect } = chai;

// Controllers under test
const {
    viewResults,
    exportResults,
    getVoteStats,
    getAllElectionResults
} = require("../controllers/resultController");

// Models used in the controllers
const CandidateModel = require("../models/CandidateSchema");
const ElectionModel = require("../models/ElectionSchema");
const VoteModel = require("../models/VoteSchema");
const UserModel = require("../models/UserSchema");

// Mock response helper
const mockResponse = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    res.send = sinon.stub().returns(res);
    res.header = sinon.stub().returns(res);
    res.attachment = sinon.stub().returns(res);
    res.setHeader = sinon.stub().returns(res);
    return res;
};

// viewResults Tests
describe("viewResults Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        req = { query: { electionId: "elec123" } };
        sinon.stub(CandidateModel, "find");
    });

    afterEach(() => sinon.restore());

    // T037 - Missing electionId
    it("T037: should return 400 if electionId is missing", async () => {
        req.query = {};
        await viewResults(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    // T038 - No candidates found
    it("T038: should return 404 if no candidates exist", async () => {
        CandidateModel.find.resolves([]);
        await viewResults(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T039 - Successful results
    it("T039: should return 200 with sorted results", async () => {
        CandidateModel.find.resolves([{ name: "Alice", voteCount: 5 }]);
        await viewResults(req, res);
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("results");
    });
});


// exportResults Tests
describe("exportResults Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        req = { query: { electionId: "elec123" } };
        sinon.stub(CandidateModel, "find");
    });

    afterEach(() => sinon.restore());

    // T040 - Missing electionId
    it("T040: should return 400 if electionId is missing", async () => {
        req.query = {};
        await exportResults(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    // T041 - No candidates found
    it("T041: should return 404 if no candidates exist", async () => {
        CandidateModel.find.resolves([]);
        await exportResults(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T042 - Successful JSON export 
    it("T042: should return 200 with JSON results", async () => {
        CandidateModel.find.resolves([{ name: "Alice", position: "President", voteCount: 10, createdAt: new Date() }]);
        await exportResults(req, res);
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("results");
    });
});

// getVoteStats Tests
describe("getVoteStats Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        req = { query: { electionId: "elec123" } };
        sinon.stub(ElectionModel, "findById");
        sinon.stub(VoteModel, "countDocuments");
        sinon.stub(UserModel, "countDocuments");
    });

    afterEach(() => sinon.restore());

    // T043 - Missing electionId
    it("T043: should return 400 if electionId is missing", async () => {
        req.query = {};
        await getVoteStats(req, res);
        expect(res.status.calledWith(400)).to.be.true;
    });

    // T044 - Election not found
    it("T044: should return 404 if election not found", async () => {
        ElectionModel.findById.resolves(null);
        await getVoteStats(req, res);
        expect(res.status.calledWith(404)).to.be.true;
    });

    // T045 - Successful stats
    it("T045: should return 200 with turnout stats", async () => {
        ElectionModel.findById.resolves({ _id: "elec123" });
        VoteModel.countDocuments.resolves(50);
        UserModel.countDocuments.resolves(100);
        await getVoteStats(req, res);
        expect(res.status.calledWith(200)).to.be.true;
        const data = res.json.firstCall.args[0];
        expect(data).to.have.property("turnoutPercentage");
    });
});

// getAllElectionResults Tests
describe("getAllElectionResults Controller", () => {
    let req, res;

    beforeEach(() => {
        res = mockResponse();
        sinon.stub(ElectionModel, "find");
        sinon.stub(CandidateModel, "find");
    });

    afterEach(() => sinon.restore());

    // T046 - No elections found
    it("T046: should return 404 if no elections exist", async () => {
        ElectionModel.find.returns({ lean: () => Promise.resolve([]) });

        await getAllElectionResults(req, res);

        expect(res.status.calledWith(404)).to.be.true;
    });

    // T047 - Successful results with winner
    it("T047: should return 200 with winner candidate", async () => {
        ElectionModel.find.returns({ lean: () => Promise.resolve([{ _id: "elec1", name: "Test", description: "desc" }]) });
        CandidateModel.find.returns({ lean: () => Promise.resolve([{ _id: "cand1", name: "Alice", voteCount: 10, position: "President" }]) });

        await getAllElectionResults(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.firstCall.args[0].results[0].winner).to.include({ name: "Alice" });
    });


    // T048 - Database error
    it("T048: should return 500 if a database error occurs", async () => {
        ElectionModel.find.throws(new Error("DB error"));

        await getAllElectionResults(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "DB error");
    });
});


