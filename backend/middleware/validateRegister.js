function validateRegister(req, res, next) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }
    next(); // continue if valid
}

module.exports = validateRegister;
