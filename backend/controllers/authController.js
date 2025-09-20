const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin, Voter, User } = require("../models/User");
const UserModel = require("../models/UserSchema");
const authManager = require("../services/AuthManager");

// Factory Pattern (UserFactory)
class UserFactory {
    static createUser(type, id, name, email, password) {
        if (type === "Admin") return new Admin(id, name, email, password);
        if (type === "Voter") return new Voter(id, name, email, password);
        throw new Error("Invalid user type");
    }
}

// Proxy Pattern (AdminProxy)
class AdminProxy {
    constructor(user) {
        this.user = user;
    }

    performAdminAction(action) {
        if (!this.user.isAdmin) {
            throw new Error("Access denied. Admins only.");
        }
        return action();
    }
}


// Register User
const register = async (req, res) => {
    try {
        let { type, name, email, password } = req.body;

        // Check if email already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await authManager.hashPassword(password);

        // Save to DB
        const userDoc = await UserModel.create({
            role: type,
            name,
            email,
            password: hashedPassword
        });

        // Wrap object via Factory
        const userObj = UserFactory.createUser(
            userDoc.role,
            userDoc._id.toString(),
            userDoc.name,
            userDoc.email,
            userDoc.password
        );

        // Generate token
        const token = authManager.generateToken(userObj);

        res.status(201).json({
            message: "User registered successfully",
            role: userObj.getRole(),
            token
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user in DB
        const userDoc = await UserModel.findOne({ email });
        if (!userDoc) {
            return res.status(401).json({ message: "User not found" });
        }

        // Compare password
        const isMatch = await authManager.comparePassword(password, userDoc.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Wrap user via Factory
        const userObj = UserFactory.createUser(
            userDoc.role,
            userDoc._id.toString(),
            userDoc.name,
            userDoc.email,
            userDoc.password
        );

        // Generate JWT
        const token = authManager.generateToken(userObj);

        // Respond
        res.status(200).json({
            message: "Login successful",
            user: {
                id: userObj.id,
                name: userObj.name,
                email: userObj.email,
                role: userObj.getRole()
            },
            token
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Something went wrong. Please try again." });
    }
};


// Get My Profile
const getMyProfile = async (req, res) => {
    try {
        // Find user by ID 
        const user = await UserModel.findById(req.user.id).select(
            "name email role university"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            university: user.university
        });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Server error" });
    }
};
module.exports = { register, login, AdminProxy, getMyProfile };