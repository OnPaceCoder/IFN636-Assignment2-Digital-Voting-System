import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";

const ElectionDropdown = ({ value, onChange }) => {
    const { user } = useAuth();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchElections = async () => {
            try {
                setLoading(true);
                const token = user?.token || localStorage.getItem("token");

                const { data } = await axiosInstance.get("/api/election/", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                setElections(data?.elections || []);
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to load elections");
            } finally {
                setLoading(false);
            }
        };

        fetchElections();
    }, [user]);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Election
            </label>
            {loading ? (
                <p className="text-gray-500">Loading elections…</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)} // sends electionId
                    className="w-full border rounded-lg px-3 py-2"
                >
                    <option value="">-- Choose an election --</option>
                    {elections.map((e) => (
                        <option key={e._id} value={e._id}>
                            {e.title}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default ElectionDropdown;
