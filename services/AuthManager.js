// Singleton Pattern (AuthManager)
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthManager {
    constructor() {
        if (AuthManager.instance) {
            return AuthManager.instance;
        }
        AuthManager.instance = this;
    }

    static getInstance() {
        if (!AuthManager.instance) {
            AuthManager.instance = new AuthManager();
        }
        return AuthManager.instance;
    }

    generateToken(user) {
        return jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.getRole() },
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

// Export the singleton instance using getInstance
module.exports = AuthManager.getInstance();
