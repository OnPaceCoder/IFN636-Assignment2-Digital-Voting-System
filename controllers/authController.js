// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Admin, Voter } = require("../models/User");


// ==============================
// Factory Pattern (UserFactory)
// ==============================
class UserFactory {
    static createUser(type, id, name, email, password) {
        if (type === "Admin") return new Admin(id, name, email, password);
        if (type === "Voter") return new Voter(id, name, email, password);
        throw new Error("Invalid user type");
    }
}


// ==============================
// Singleton Pattern (AuthManager)
// ==============================
class AuthManager {
    constructor() {
        if (AuthManager.instance) return AuthManager.instance;
        AuthManager.instance = this;
    }

    generateToken(user) {
        return jwt.sign(
            { id: user.id, role: user.getRole() },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
    }

    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async comparePassword(password, hashed) {
        return await bcrypt.compare(password, hashed);
    }
}

const authManager = new AuthManager();


// ==============================
// Proxy Pattern (AdminProxy)
// ==============================
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


// ==============================
// Controllers (register, login)
// ==============================

// Register User
exports.register = async (req, res) => {
    try {
        const { type, name, email, password } = req.body;

        // Hash password (encapsulation)
        const hashedPassword = await authManager.hashPassword(password);

        // Create user via Factory
        const user = UserFactory.createUser(type, Date.now(), name, email, hashedPassword);

        // In a real system, save to DB (Mongo). For now, simulate with memory.
        const token = authManager.generateToken(user);

        res.status(201).json({
            message: "User registered",
            role: user.getRole(),
            token
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ⚠️ Example only: normally fetch user from DB
        const dummyUser = new Voter(1, "Priyank", email, await authManager.hashPassword("password123"));

        const isMatch = await authManager.comparePassword(password, dummyUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = authManager.generateToken(dummyUser);

        res.json({
            message: "Login successful",
            role: dummyUser.getRole(),
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Example: Admin-only action using Proxy
exports.adminOnly = (req, res) => {
    try {
        const currentUser = new Admin(99, "Super Admin", "admin@test.com", "securePass");
        const proxy = new AdminProxy(currentUser);

        const result = proxy.performAdminAction(() => "Candidate deleted successfully");
        res.json({ message: result });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};
