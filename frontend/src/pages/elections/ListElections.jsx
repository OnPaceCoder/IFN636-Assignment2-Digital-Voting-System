import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ElectionCard = ({ election }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-lg shadow-md p-5 flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900">{election.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{election.description}</p>
            <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${election.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
            >
                {election.isOpen ? "Open" : "Closed"}
            </span>

            {election.isOpen && (
                <button
                    onClick={() => navigate(`/elections/${election._id}`)}
                    className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                    Enter Election
                </button>
            )}
        </div>
    );
};

const ElectionListPage = () => {
    const { user } = useAuth();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const fetchElections = async () => {
            try {
                setLoading(true);

                // get token safely (from context or localStorage)
                const token = user?.token || localStorage.getItem("token");

                const { data } = await axiosInstance.get("/api/election", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });


                setElections(Array.isArray(data.elections) ? data.elections : []);

            } catch (e) {
                setErr(e?.response?.data?.message || "Failed to load elections");
            } finally {
                setLoading(false);
            }
        };

        fetchElections();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Elections</h1>

                {loading ? (
                    <div className="text-gray-600">Loading…</div>
                ) : err ? (
                    <div className="text-red-600">{err}</div>
                ) : elections.length === 0 ? (
                    <div className="text-gray-600">No elections available.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {elections.map((e) => (
                            <ElectionCard key={e._id} election={e} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionListPage;
