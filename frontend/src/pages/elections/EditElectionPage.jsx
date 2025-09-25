import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";

const EditElectionPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        isOpen: true,
    });

    useEffect(() => {
        if (state?.election) {
            setFormData({
                title: state.election.title || "",
                description: state.election.description || "",
                isOpen: state.election.isOpen ?? true,
            });
        }
    }, [state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token;
            await axiosInstance.put(
                "/api/election/toggle",
                {
                    electionId: state.election._id,
                    title: formData.title,
                    description: formData.description,
                    isOpen: formData.isOpen,
                },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            alert("Election updated successfully!");
            navigate("/list-elections");
        } catch (e) {
            alert(e?.response?.data?.message || "Error updating election");
        }
    };

    const handleToggle = () => {
        setFormData((prev) => ({ ...prev, isOpen: !prev.isOpen }));
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Election</h1>
                    <button
                        onClick={() => navigate("/list-elections")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back to Elections
                    </button>
                </div>

                {/* Form */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-gray-700 font-medium">
                                Status:{" "}
                                <span className={formData.isOpen ? "text-green-600" : "text-red-600"}>
                                    {formData.isOpen ? "Open" : "Closed"}
                                </span>
                            </span>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`px-3 py-2 rounded-lg text-white text-sm font-medium ${formData.isOpen
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {formData.isOpen ? "Close Election" : "Open Election"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditElectionPage;
