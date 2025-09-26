import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Protect: Only admins can access
    if (!user || user?.user?.role !== "Admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
                    <p className="text-gray-600 mt-2">You must be an admin to view this page.</p>
                </div>
            </div>
        );
    }

    const sections = [
        {
            title: "Elections",
            description: "Manage elections (create, update, close, view).",
            path: "/list-elections",
        },
        {
            title: "Candidates",
            description: "Add and manage candidates for elections.",
            path: "/list-candidates",
        },
        {
            title: "Feedback",
            description: "View feedback submitted by users.",
            path: "/admin-feedback",
        },
        {
            title: "Results",
            description: "View and export election results.",
            path: "/results",
        },
        {
            title: "Archived Elections",
            description: "View archieved election data.",
            path: "/archived-elections",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((section) => (
                        <div
                            key={section.title}
                            className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
                            onClick={() => navigate(section.path)}
                        >
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {section.title}
                                </h2>
                                <p className="text-gray-600 mt-2">{section.description}</p>
                            </div>
                            <button
                                className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => navigate(section.path)}
                            >
                                Manage {section.title}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
