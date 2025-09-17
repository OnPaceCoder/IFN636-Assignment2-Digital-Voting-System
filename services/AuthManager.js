// Singleton Pattern (AuthManager)

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
