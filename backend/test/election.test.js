const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const { expect } = chai;

const { createElection, toggleElection, getAllElections, deleteElection } = require("../controllers/electionController");
const ElectionModel = require("../models/ElectionSchema");
const { AdminProxy } = require("../controllers/authController");

// CreateElection Tests
describe("CreateElection Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    // T013 - Successful election creation
    it("T013: should create a new election successfully", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            body: { title: "Student Council 2025", description: "Annual election" }
        };

        // save the election
        const savedElection = { _id: "e1", ...req.body };
        sinon.stub(ElectionModel.prototype, "save").resolves(savedElection);
        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await createElection(req, res);

        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWithMatch({ message: "Election created" })).to.be.true;
    });

    // T014 - Missing required fields
    it("T014: should return 400 if title or description is missing", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: { title: "", description: "" }
        };

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await createElection(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ error: "Title and description are required" })).to.be.true;
    });

    // T015 - Unexpected error
    it("T015: should return 500 if an error occurs", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            body: { title: "Test", description: "Test desc" }
        };

        sinon.stub(AdminProxy.prototype, "performAdminAction").throws(new Error("DB Error"));

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await createElection(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;
    });
});

// ToggleElection Tests
describe("ToggleElection Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    // T016 - Successful toggle
    it("T016: should update election and return 200", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            body: { electionId: "123", isOpen: true, title: "Updated Title", description: "Updated Desc" }
        };

        const updatedElection = {
            _id: "123",
            title: "Updated Title",
            description: "Updated Desc",
            isOpen: true
        };

        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());
        sinon.stub(ElectionModel, "findByIdAndUpdate").resolves(updatedElection);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await toggleElection(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({ election: updatedElection })).to.be.true;
    });

    // T017 - Missing required fields
    it("T017: should return 400 if electionId or isOpen is missing", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId() },
            body: { electionId: "", isOpen: null }
        };

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await toggleElection(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ error: "electionId and isOpen are required" })).to.be.true;
    });

    // T018 - Election not found
    it("T018: should return 404 if election not found", async () => { // updated from 403 → 500
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            body: { electionId: "999", isOpen: false }
        };

        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());
        sinon.stub(ElectionModel, "findByIdAndUpdate").resolves(null);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await toggleElection(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ error: "Election not found" })).to.be.true;
    });
});

// GetElection Tests
describe("GetAllElections Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    // T019 - Should return elections successfully
    it("T019: should return 200 with list of elections", async () => {
        const elections = [
            { _id: new mongoose.Types.ObjectId(), title: "Election 1", description: "Desc 1" },
            { _id: new mongoose.Types.ObjectId(), title: "Election 2", description: "Desc 2" },
        ];

        sinon.stub(ElectionModel, "find").returns({
            sort: sinon.stub().returns(elections),
        });

        const req = {};
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await getAllElections(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({
            message: "Elections retrieved successfully",
            count: elections.length,
            elections,
        })).to.be.true;
    });

    // T020 - No elections found
    it("T020: should return 404 if no elections found", async () => {
        sinon.stub(ElectionModel, "find").returns({
            sort: sinon.stub().returns([]),
        });

        const req = {};
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await getAllElections(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ message: "No elections found" })).to.be.true;
    });

    // T021 - Internal server error
    it("T021: should return 500 if DB error occurs", async () => {
        sinon.stub(ElectionModel, "find").throws(new Error("DB Error"));

        const req = {};
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await getAllElections(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;
    });
});

// DeleteCandidate Tests

// DeleteElection Tests
describe("DeleteElection Controller", () => {
    afterEach(() => {
        sinon.restore();
    });

    // T022 - Successful deletion
    it("T022: should delete election successfully", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            params: { id: "123" }
        };

        const deletedElection = { _id: "123", title: "Test Election", description: "Desc" };

        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());
        sinon.stub(ElectionModel, "findByIdAndDelete").resolves(deletedElection);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteElection(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWithMatch({
            message: "Election deleted",
            election: deletedElection
        })).to.be.true;
    });

    // T023 - Election not found
    it("T023: should return 404 if election does not exist", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            params: { id: "999" }
        };

        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());
        sinon.stub(ElectionModel, "findByIdAndDelete").resolves(null);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteElection(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.calledWithMatch({ error: "Election not found" })).to.be.true;
    });

    // T024 - Internal server error
    it("T024: should return 500 if DB error occurs", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            params: { id: "123" }
        };

        sinon.stub(AdminProxy.prototype, "performAdminAction").throws(new Error("DB Error"));

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteElection(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ error: "DB Error" })).to.be.true;
    });
});
