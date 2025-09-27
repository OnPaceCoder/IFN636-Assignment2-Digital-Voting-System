const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const { expect } = chai;

const { addCandidate, getCandidateById, deleteCandidate, updateCandidate } = require("../controllers/candidateController");
const ElectionSchema = require("../models/ElectionSchema");
const CandidateSchema = require("../models/CandidateSchema");
const { AdminProxy } = require("../controllers/authController");

// AddCandidate Tests
describe("AddCandidate Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    // T001 - Create candidate successfully
    it("T001: should create a new candidate successfully", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "a@a.com" },
            body: {
                name: "Priyank",
                position: "President",
                manifesto: "Test manifesto",
                photoUrl: "http://github.com/Priyank.jpeg",
                electionId: "123"
            }
        };

        // Election data in DB
        sinon.stub(ElectionSchema, "findById").resolves({
            _id: "123",
            title: "Election",
            description: "Desc",
            isOpen: true,
            candidates: [],
            save: sinon.stub().resolves()
        });

        // candidate save
        sinon.stub(CandidateSchema.prototype, "save").resolves({
            _id: "c1",
            ...req.body
        });

        // admin check
        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await addCandidate(req, res);

        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("message", "Candidate added successfully");
    });

    // T002 - Missing fields
    it("T002: should return 400 if required fields are missing", async () => {
        const req = { user: { id: new mongoose.Types.ObjectId() }, body: {} };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await addCandidate(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property(
            "error",
            "Name, position, and electionId are required"
        );
    });

    // T003 - Election not found
    it("T003: should return 404 if election does not exist", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: { name: "Bob", position: "VP", electionId: "999" }
        };

        sinon.stub(ElectionSchema, "findById").resolves(null);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await addCandidate(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "Election not found");
    });
});

// GetCandidateById Tests
describe("GetCandidateById Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    // T004 - Candidate found
    it("T004: should return candidate details successfully", async () => {
        const req = {
            params: { id: "123" },
            user: { isAdmin: true }
        };

        const candidateDoc = {
            _id: "123",
            name: "Alice",
            position: "President",
            manifesto: "Test manifesto",
            photoUrl: "http://img.com/pic.jpg",
            status: "active",
            voteCount: 5,
            electionId: "e1"
        };

        sinon.stub(CandidateSchema, "findById").resolves(candidateDoc);

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await getCandidateById(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ name: "Alice", votes: 5 })).to.be.true;
    });

    // T005 - Candidate not found
    it("T005: should return 404 if candidate does not exist", async () => {
        const req = { params: { id: "999" }, user: { isAdmin: true } };
        sinon.stub(CandidateSchema, "findById").resolves(null);

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await getCandidateById(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Candidate not found" })).to.be.true;
    });

    // T006 - Restrict access for non-admin candidates
    it("T006: should return 403 if user is not admin", async () => {
        const req = { params: { id: "456" }, user: { isAdmin: false } };

        const candidateDoc = {
            _id: "456",
            name: "Bob",
            position: "VP",
            manifesto: "Withdrawn manifesto",
            photoUrl: "http://img.com/pic2.jpg",
            status: "withdrawn",
            voteCount: 10,
            electionId: "e2"
        };

        sinon.stub(CandidateSchema, "findById").resolves(candidateDoc);

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        await getCandidateById(req, res);

        expect(res.status.calledWith(403)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Not authorized to view this candidate" })).to.be.true;
    });
});

// DeleteCandidate Tests
describe("DeleteCandidate Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    // T007 - Candidate deleted successfully
    it("T007: should delete candidate successfully", async () => {
        const req = { params: { id: "123" }, user: { id: "u1", name: "Admin", email: "a@a.com" } };

        const candidateDoc = { _id: "123", electionId: "e1" };
        sinon.stub(CandidateSchema, "findById").resolves(candidateDoc);
        sinon.stub(CandidateSchema, "findByIdAndDelete").resolves(candidateDoc);
        sinon.stub(ElectionSchema, "updateOne").resolves({});
        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteCandidate(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Candidate deleted successfully" })).to.be.true;
    });

    // T008 - Candidate not found
    it("T008: should return 404 if candidate does not exist", async () => {
        const req = { params: { id: "333" }, user: { id: "u1" } };
        sinon.stub(CandidateSchema, "findById").resolves(null);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteCandidate(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ error: "Candidate not found" })).to.be.true;
    });

    // T009 - Internal error or exception
    it("T009: should return 403 if an error occurs", async () => {
        const req = { params: { id: "123" }, user: { id: "u1" } };
        sinon.stub(CandidateSchema, "findById").throws(new Error("DB error"));

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteCandidate(req, res);

        expect(res.status.calledWith(403)).to.be.true;
        expect(res.json.calledWithMatch({ error: "DB error" })).to.be.true;
    });
});

// UpdateCandidate Tests 
describe("UpdateCandidate Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    // T010 - Successful update
    it("T010: should update candidate successfully when valid data provided", async () => {
        const req = {
            params: { id: new mongoose.Types.ObjectId() },
            body: { name: "Updated Name" },
            user: { id: "1", name: "Admin", email: "admin@test.com" }
        };

        // candidate details
        const candidateDoc = {
            _id: req.params.id,
            name: "Old Name",
            save: sinon.stub().resolves(),
            position: "President",
            manifesto: "Old manifesto",
            photoUrl: "old.jpg",
            status: "active",
            voteCount: 0,
            electionId: "e1"
        };

        sinon.stub(CandidateSchema, "findById").resolves(candidateDoc);
        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await updateCandidate(req, res);

        expect(candidateDoc.name).to.equal("Updated Name");
        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Candidate updated successfully" })).to.be.true;
    });

    // T011 - No fields provided
    it("T011: should return 400 if no fields provided for update", async () => {
        const req = {
            params: { id: "123" },
            body: {},
            user: { id: "1" }
        };

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await updateCandidate(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ error: "At least one field must be provided for update" })).to.be.true;
    });

    // T012 - Candidate not found
    it("T012: should return 404 if candidate does not exist", async () => {
        const req = {
            params: { id: "999" },
            body: { name: "New Name" },
            user: { id: "1" }
        };

        sinon.stub(CandidateSchema, "findById").resolves(null);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await updateCandidate(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ error: "Candidate not found" })).to.be.true;
    });
});

