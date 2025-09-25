import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ArchiveElection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [results, setResults] = useState([]);

    // Protect: Admins only (you can also allow voters if you want)
    useEffect(() => {
        if (!user) navigate("/login");
        else if (user?.user.role !== "Admin") navigate("/");
    }, [user, navigate]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                const token = user?.token || localStorage.getItem("token");
                const { data } = await axiosInstance.get("/api/result/history", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setResults(data.results || []);
            } catch (e) {
                setErr(e?.response?.data?.message || "Failed to load election results");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchResults();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Election Results Archive
                    </h1>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Results Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Election ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Winner
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Votes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-gray-500">
                                            Loading…
                                        </td>
                                    </tr>
                                ) : err ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-red-600">
                                            {err}
                                        </td>
                                    </tr>
                                ) : results.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-gray-500">
                                            No election results available.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((res) => (
                                        <tr key={res.electionId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {res.electionId}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {res.description}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {res.winner ? res.winner.name : "No winner"}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {res.winner ? res.winner.voteCount : "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchiveElection;
