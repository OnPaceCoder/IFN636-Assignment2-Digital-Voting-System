import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import ElectionDropdown from "../../components/candidates/ElectionDropdown";

const ElectionResultsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [electionId, setElectionId] = useState("");
    const [stats, setStats] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [method, setMethod] = useState("vote");
    const [exportType, setExportType] = useState("");

    // Fetch results + stats whenever electionId or method changes
    useEffect(() => {
        const fetchData = async () => {
            if (!electionId) return;
            try {
                setLoading(true);
                setErr("");
                const token = user?.token || localStorage.getItem("token");

                // Fetch stats
                const statsRes = await axiosInstance.get(`/api/result/stats?electionId=${electionId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setStats(statsRes.data);

                // Fetch results
                const resultsRes = await axiosInstance.get(
                    `/api/result?electionId=${electionId}&method=${method}`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                setResults(resultsRes.data.results || []);
            } catch (e) {
                setErr(e?.response?.data?.error || "Failed to load results");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [electionId, method, user]);

    const handleExport = async (type) => {
        try {
            const token = user?.token || localStorage.getItem("token");
            const url = `/api/result/export?electionId=${electionId}&method=${method}&type=${type}`;

            const res = await axiosInstance.post(
                url,
                {},
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    responseType: type === "pdf" || type === "csv" ? "blob" : "json",
                }
            );

            if (type === "pdf" || type === "csv") {
                const blob = new Blob([res.data], {
                    type: type === "pdf" ? "application/pdf" : "text/csv",
                });
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = `results_${electionId}.${type}`;
                link.click();
            } else {
                console.log("JSON Results:", res.data);
                alert("JSON results logged in console");
            }
        } catch (e) {
            alert(e?.response?.data?.error || "Failed to export results");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Election Results
                    </h1>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Election Selector */}
                <div className="mb-6">
                    <ElectionDropdown
                        value={electionId}
                        onChange={(id) => setElectionId(id)}
                    />
                </div>

                {/* Stats */}
                {/* Stats */}
                {stats && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">
                            Election Statistics
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Eligible Voters */}
                            <div className="bg-white shadow-md rounded-lg p-5 flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-600">Eligible Voters</p>
                                <p className="mt-2 text-2xl font-bold text-blue-600">{stats.eligibleVoters}</p>
                            </div>

                            {/* Total Votes Cast */}
                            <div className="bg-white shadow-md rounded-lg p-5 flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-600">Total Votes Cast</p>
                                <p className="mt-2 text-2xl font-bold text-blue-600">{stats.totalVotesCast}</p>
                            </div>

                            {/* Turnout */}
                            <div className="bg-white shadow-md rounded-lg p-5 flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-600">Turnout</p>
                                <p className="mt-2 text-2xl font-bold text-blue-600">
                                    {stats.turnoutPercentage}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                {/* Sorting + Export */}
                {/* Sorting + Export */}
                {electionId && (
                    <div className="mb-4 flex items-center justify-between gap-3">
                        {/* Sorting dropdown */}
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500"
                        >
                            <option value="vote">Sort by Votes</option>
                            <option value="name">Sort by Name</option>
                            <option value="latest">Sort by Latest</option>
                        </select>

                        {/* Export dropdown + button */}
                        <div className="flex gap-2 items-center">
                            <select
                                value={exportType}
                                onChange={(e) => setExportType(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Export as…</option>
                                <option value="csv">CSV</option>
                                <option value="pdf">PDF</option>
                                <option value="json">JSON</option>
                            </select>
                            <button
                                onClick={() => exportType && handleExport(exportType)}
                                disabled={!exportType}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Export
                            </button>
                        </div>
                    </div>
                )}


                {/* Results Table */}
                {electionId && (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Position</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Votes</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Created</th>
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
                                                No results available.
                                            </td>
                                        </tr>
                                    ) : (
                                        results.map((c, index) => (
                                            <tr key={c._id || index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                                                <td className="px-4 py-3 text-gray-700">{c.position}</td>
                                                <td className="px-4 py-3 text-gray-700">{c.voteCount}</td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {new Date(c.createdAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionResultsPage;
