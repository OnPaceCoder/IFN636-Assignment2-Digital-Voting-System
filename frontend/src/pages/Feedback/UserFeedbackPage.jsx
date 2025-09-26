import React, { useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";

const UserFeedbackPage = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return setError("Feedback cannot be empty.");

        try {
            setLoading(true);
            setError("");
            setSuccess("");
            const token = user?.token || localStorage.getItem("token");

            const res = await axiosInstance.post(
                "/api/feedback",
                { message },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            setSuccess(res.data.message || "Feedback submitted successfully!");
            setMessage("");
        } catch (e) {
            setError(e?.response?.data?.error || "Failed to submit feedback");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Submit Feedback</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                {success && <p className="mt-4 text-green-600">{success}</p>}
                {error && <p className="mt-4 text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default UserFeedbackPage;
