import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";

const UserFeedbackPage = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const token = user?.token || localStorage.getItem("token");

    // Fetch feedback for the logged-in user
    const fetchFeedbacks = async () => {
        if (!user) return;

        try {
            const res = await axiosInstance.get(`/api/feedback/my/${user?.user?.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            console.log("Fetched feedbacks:", res);
            setFeedbacks(res.data.feedbacks || []);
        } catch (e) {
            setError(e?.response?.data?.error || "No Feedbacks found");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [user]);

    // Submit new feedback
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return setError("Feedback cannot be empty.");

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const res = await axiosInstance.post(
                "/api/feedback",
                { message },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            setSuccess(res.data.message || "Feedback submitted successfully!");
            setMessage("");

            // Refresh feedback list
            fetchFeedbacks();
        } catch (e) {
            setError(e?.response?.data?.error || "Failed to submit feedback");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Feedback
                </h1>

                {/* Feedback form */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="4"
                        placeholder="Enter your feedback..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Submitting…" : "Submit Feedback"}
                    </button>
                </form>
                {success && <p className="mt-2 text-green-600">{success}</p>}
                {error && <p className="mt-2 text-red-600">{error}</p>}

                {/* Feedback list */}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Previous Feedback
                    </h2>
                    {fetching ? (
                        <p className="text-gray-500">Loading your feedback…</p>
                    ) : feedbacks.length === 0 ? (
                        <p className="text-gray-500">
                            You haven’t submitted any feedback yet.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {feedbacks.map((fb) => (
                                <li key={fb._id} className="py-3">
                                    <p className="text-gray-700">{fb.message}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(fb.createdAt).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserFeedbackPage;
