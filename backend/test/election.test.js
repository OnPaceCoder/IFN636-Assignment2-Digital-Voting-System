const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const { expect } = chai;

const { createElection, toggleElection, getAllElections, deleteElection } = require("../controllers/electionController");
const ElectionModel = require("../models/ElectionSchema");
const { AdminProxy } = require("../controllers/authController");

// CreateElection Tests
describe("CreateElection Controller", () => {
    afterEach(() => sinon.restore());

    // T013 - Successful election creation
    it("T013: should create a new election successfully", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            body: { title: "Student Council 2025", description: "Annual election" }
        };

        const savedElection = { _id: "e1", ...req.body };
        sinon.stub(ElectionModel.prototype, "save").resolves(savedElection);
        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await createElection(req, res);

        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("message", "Election created");
    });

    // T014 - Missing required fields
    it("T014: should return 400 if title or description is missing", async () => {
        const req = { user: { id: new mongoose.Types.ObjectId() }, body: { title: "", description: "" } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await createElection(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "Title and description are required");
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
        expect(res.json.firstCall.args[0]).to.have.property("error", "DB Error");
    });
});

// ToggleElection Tests
describe("ToggleElection Controller", () => {
    afterEach(() => sinon.restore());

    // T016 - Successful toggle
    it("T016: should update election and return 200", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            body: { electionId: "123", isOpen: true, title: "Updated Title", description: "Updated Desc" }
        };

        const updatedElection = { _id: "123", ...req.body };

        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());
        sinon.stub(ElectionModel, "findByIdAndUpdate").resolves(updatedElection);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await toggleElection(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("election");
    });

    // T017 - Missing required fields
    it("T017: should return 400 if electionId or isOpen is missing", async () => {
        const req = { user: { id: new mongoose.Types.ObjectId() }, body: { electionId: "", isOpen: null } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await toggleElection(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "electionId and isOpen are required");
    });

    // T018 - Election not found
    it("T018: should return 404 if election not found", async () => {
        const req = {
            user: { id: new mongoose.Types.ObjectId(), name: "Admin", email: "admin@test.com" },
            body: { electionId: "999", isOpen: false }
        };

        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());
        sinon.stub(ElectionModel, "findByIdAndUpdate").resolves(null);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await toggleElection(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "Election not found");
    });
});

// GetElection Tests
describe("GetAllElections Controller", () => {
    afterEach(() => sinon.restore());

    // T019 - Should return elections successfully
    it("T019: should return 200 with list of elections", async () => {
        const elections = [
            { _id: new mongoose.Types.ObjectId(), title: "Election 1", description: "Desc 1" },
            { _id: new mongoose.Types.ObjectId(), title: "Election 2", description: "Desc 2" },
        ];

        sinon.stub(ElectionModel, "find").returns({ sort: () => elections });

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
        await getAllElections({}, res);

        expect(res.status.calledWith(200)).to.be.true;
        const body = res.json.firstCall.args[0];
        expect(body).to.include({ message: "Elections retrieved successfully", count: elections.length });
    });

    // T020 - No elections found
    it("T020: should return 404 if no elections found", async () => {
        sinon.stub(ElectionModel, "find").returns({ sort: () => [] });

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
        await getAllElections({}, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("message", "No elections found");
    });

    // T021 - Internal server error
    it("T021: should return 500 if DB error occurs", async () => {
        sinon.stub(ElectionModel, "find").throws(new Error("DB Error"));

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
        await getAllElections({}, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "DB Error");
    });
});

// DeleteElection Tests
describe("DeleteElection Controller", () => {
    afterEach(() => sinon.restore());

    // T022 - Successful deletion
    it("T022: should delete election successfully", async () => {
        const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: "123" } };
        const deletedElection = { _id: "123", title: "Test Election", description: "Desc" };

        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());
        sinon.stub(ElectionModel, "findByIdAndDelete").resolves(deletedElection);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
        await deleteElection(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("election", deletedElection);
    });

    // T023 - Election not found
    it("T023: should return 404 if election does not exist", async () => {
        const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: "999" } };

        sinon.stub(AdminProxy.prototype, "performAdminAction").callsFake(cb => cb());
        sinon.stub(ElectionModel, "findByIdAndDelete").resolves(null);

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
        await deleteElection(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "Election not found");
    });

    // T024 - Internal server error
    it("T024: should return 500 if DB error occurs", async () => {
        const req = { user: { id: new mongoose.Types.ObjectId() }, params: { id: "123" } };

        sinon.stub(AdminProxy.prototype, "performAdminAction").throws(new Error("DB Error"));

        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
        await deleteElection(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.firstCall.args[0]).to.have.property("error", "DB Error");
    });
});
