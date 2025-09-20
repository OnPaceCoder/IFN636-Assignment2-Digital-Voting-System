const jwt = require("jsonwebtoken");
const ConfigManager = require("../patterns/ConfigManager");
function authMiddleware(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, ConfigManager.get("jwtSecret"));
        req.user = decoded; // attach user info
        next(); // pass to next middleware or controller
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = authMiddleware;
