import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import EditCandidateForm from "../../components/candidates/EditCandidateForm";

const EditCandidatePage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // still useful for patching
    const { user } = useAuth();
    const { state } = useLocation(); // 👈 candidate comes from here

    const [candidate, setCandidate] = useState(state?.candidate || null);

    // Check if user is admin
    useEffect(() => {
        if (!user) navigate("/login");
        else if (user?.user?.role !== "Admin") navigate("/");
    }, [user, navigate]);

    // Integration of backend API for updating candidate
    const handleUpdate = async (payload) => {
        try {
            const token = user?.token;
            await axiosInstance.put(`/api/candidate/${id}`, payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            alert("Candidate updated successfully!");
            navigate("/list-candidates");
        } catch (e) {
            alert(e?.response?.data?.message || "Error updating candidate");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Candidate</h1>
                    <button
                        onClick={() => navigate("/list-candidates")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back to Candidates
                    </button>
                </div>

                {/* Body */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    {!candidate ? (
                        <p className="text-gray-600">Candidate not found. Please go back.</p>
                    ) : (
                        <EditCandidateForm
                            initialValues={candidate}
                            onSubmit={handleUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditCandidatePage;
