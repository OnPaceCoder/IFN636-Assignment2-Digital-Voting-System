import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MyVotePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [votes, setVotes] = useState([]);

    // Change-vote UI states
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeElection, setActiveElection] = useState(null);

    // Withdraw state
    const [withdrawing, setWithdrawing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    // Fetch all votes
    useEffect(() => {
        const fetchVotes = async () => {
            try {
                setLoading(true);
                setError("");
                const token = user?.token || localStorage.getItem("token");

                const { data } = await axiosInstance.get("/api/vote/status", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    params: { electionId: null }, // ✅ fetch all votes
                });

                if (data?.votes) {
                    setVotes(data.votes);
                } else {
                    setVotes([]);
                }
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to fetch your votes");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchVotes();
    }, [user]);

    // Open Change Vote modal
    const openChange = async (vote) => {
        try {
            setActiveElection(vote.election);
            const token = user?.token || localStorage.getItem("token");

            const { data } = await axiosInstance.get("/api/candidate", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                params: { electionId: vote.election.id },
            });

            const items = (data?.items || []).filter(c => c._id !== vote.candidateId);
            setCandidates(items);
            setSelected(null);
            setShowChangeModal(true);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to load candidates");
        }
    };

    // Submit Change Vote
    const submitChange = async () => {
        if (!selected || !activeElection) return;
        try {
            setSubmitting(true);
            const token = user?.token || localStorage.getItem("token");

            await axiosInstance.patch("/api/vote", {
                newCandidateId: selected._id,
                electionId: activeElection.id,
            }, {
                headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {},
            });

            // Refresh votes after change
            const { data } = await axiosInstance.get("/api/vote/status", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                params: { electionId: null },
            });
            setVotes(data?.votes || []);
            setShowChangeModal(false);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to change your vote");
        } finally {
            setSubmitting(false);
        }
    };

    // Open Withdraw modal
    const openWithdraw = (vote) => {
        setActiveElection(vote.election);
        setShowDeleteModal(true);
    };

    // Withdraw Vote
    const withdrawVote = async () => {
        if (!activeElection) return;
        try {
            setWithdrawing(true);
            const token = user?.token || localStorage.getItem("token");

            await axiosInstance.delete("/api/vote", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                data: { electionId: activeElection.id },
            });

            // Refresh votes
            const { data } = await axiosInstance.get("/api/vote/status", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                params: { electionId: null },
            });
            setVotes(data?.votes || []);
            setShowDeleteModal(false);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to withdraw your vote");
        } finally {
            setWithdrawing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Votes</h1>
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back
                    </button>
                </div>

                {loading ? (
                    <div className="text-gray-600">Loading…</div>
                ) : error ? (
                    <div className="text-red-600">{error}</div>
                ) : votes.length === 0 ? (
                    <div className="text-gray-600">You have not voted yet.</div>
                ) : (
                    <div className="space-y-4">
                        {votes.map((vote) => (
                            <div key={vote._id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={vote.photoUrl || "https://picsum.photos/id/237/200/300"}
                                        alt={vote.candidateName}
                                        className="h-16 w-16 rounded-full object-cover border"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{vote.candidateName}</h3>
                                        <p className="text-sm text-gray-600">{vote.position}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Election: {vote.election?.title} (
                                            {vote.election?.isOpen ? "Open" : "Closed"})
                                        </p>
                                    </div>
                                </div>
                                {vote.manifesto && <p className="mt-3">Manifesto: {vote.manifesto}</p>}
                                <p className="mt-4 text-sm text-gray-500">
                                    Voted on: {new Date(vote.when).toLocaleString()}
                                </p>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => openChange(vote)}
                                        disabled={!vote.election?.isOpen}
                                        className={`rounded-lg px-3 py-2 text-sm 
                                            ${vote.election?.isOpen
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
                                    >
                                        Change Vote
                                    </button>
                                    <button
                                        onClick={() => openWithdraw(vote)}
                                        disabled={!vote.election?.isOpen}
                                        className={`rounded-lg px-3 py-2 text-sm 
                                            ${vote.election?.isOpen
                                                ? "bg-red-600 text-white hover:bg-red-700"
                                                : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
                                    >
                                        Withdraw Vote
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Change Vote Modal */}
            {showChangeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Change your vote</h2>
                        <p className="text-gray-700 mb-4">
                            Select a different candidate for {activeElection?.title}:
                        </p>

                        <div className="max-h-64 overflow-auto space-y-2">
                            {candidates.length === 0 ? (
                                <div className="text-sm text-gray-600">No other active candidates available.</div>
                            ) : candidates.map(c => (
                                <label
                                    key={c._id}
                                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${selected?._id === c._id ? "ring-2 ring-blue-500" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        name="candidate"
                                        value={c._id}
                                        checked={selected?._id === c._id}
                                        onChange={() => setSelected(c)}
                                    />
                                    <img
                                        src={c.photoUrl || "https://picsum.photos/id/237/200/300"}
                                        alt={c.name}
                                        className="h-10 w-10 rounded-full object-cover border"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{c.name}</span>
                                        <span className="text-xs text-gray-600">{c.position}</span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowChangeModal(false); setSelected(null); }}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitChange}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                disabled={!selected || submitting}
                            >
                                {submitting ? "Updating…" : "Confirm Change"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Withdraw your vote from {activeElection?.title}?
                        </h2>
                        <p className="text-gray-700 mb-4">
                            This will remove your current vote. You can vote again later if the election is still open.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                                disabled={withdrawing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={withdrawVote}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                disabled={withdrawing}
                            >
                                {withdrawing ? "Withdrawing…" : "Confirm Withdraw"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyVotePage;
