import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";

const AdminElectionsList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [elections, setElections] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Admin protection
    useEffect(() => {
        if (!user) navigate("/login");
        else if (user?.user.role !== "Admin") navigate("/");
    }, [user, navigate]);

    const fetchElections = async () => {
        try {
            setLoading(true);
            setErr("");
            const token = user?.token;
            const res = await axiosInstance.get("/api/election", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setElections(res.data?.elections || []);
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to load elections");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchElections();
    }, []);

    const confirmDelete = (id) => {
        setSelectedId(id);
        setShowModal(true);
    };

    // Delete election
    const handleDelete = async () => {
        try {
            const token = user?.token;
            await axiosInstance.delete(`/api/election/${selectedId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            alert("Election deleted successfully!");
            fetchElections();
        } catch (e) {
            alert(e?.response?.data?.message || "Error deleting election");
        } finally {
            setShowModal(false);
            setSelectedId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Elections</h1>
                    <button
                        onClick={() => navigate("/create-election")}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                    >
                        + New Election
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Candidates</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td className="px-4 py-6 text-gray-500" colSpan={5}>Loading…</td></tr>
                                ) : err ? (
                                    <tr><td className="px-4 py-6 text-red-600" colSpan={5}>{err}</td></tr>
                                ) : elections.length === 0 ? (
                                    <tr><td className="px-4 py-6 text-gray-500" colSpan={5}>No elections found.</td></tr>
                                ) : (
                                    elections.map((e) => (
                                        <tr key={e._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{e.title}</td>
                                            <td className="px-4 py-3 text-gray-700">{e.description}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${e.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {e.isOpen ? "Open" : "Closed"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{e.candidates?.length || 0}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/update-election/${e._id}/edit`, { state: { election: e } })}
                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(e._id)}
                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this election? This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminElectionsList;
