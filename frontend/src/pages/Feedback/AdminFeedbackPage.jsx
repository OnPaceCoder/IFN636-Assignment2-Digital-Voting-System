import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminFeedbackPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        if (!user) navigate("/login");
        else if (user?.user?.role !== "Admin") navigate("/");
    }, [user, navigate]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                setLoading(true);
                setErr("");
                const token = user?.token || localStorage.getItem("token");

                const res = await axiosInstance.get("/api/feedback", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                setFeedbacks(res.data.feedbacks || []);
            } catch (e) {
                setErr(e?.response?.data?.error || "Failed to load feedback");
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [user]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;
        try {
            const token = user?.token || localStorage.getItem("token");
            await axiosInstance.delete(`/api/feedback/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
            alert("Feedback deleted successfully!");
        } catch (e) {
            alert(e?.response?.data?.error || "Failed to delete feedback");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        User Feedback
                    </h1>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Feedback
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Submitted At
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td className="px-4 py-6 text-gray-500" colSpan={3}>
                                            Loading…
                                        </td>
                                    </tr>
                                ) : err ? (
                                    <tr>
                                        <td className="px-4 py-6 text-red-600" colSpan={3}>
                                            {err}
                                        </td>
                                    </tr>
                                ) : feedbacks.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-6 text-gray-500" colSpan={3}>
                                            No feedback found.
                                        </td>
                                    </tr>
                                ) : (
                                    feedbacks.map((f) => (
                                        <tr key={f._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                {f.userId?.name} <br />
                                                <span className="text-xs text-gray-500">
                                                    {f.userId?.email}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{f.message}</td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(f.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                <button
                                                    onClick={() => handleDelete(f._id)}
                                                    className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>

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

export default AdminFeedbackPage;
