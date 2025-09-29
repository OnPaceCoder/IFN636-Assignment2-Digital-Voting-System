const {
    register,
    login,
    getMyProfile
} = require("../controllers/authController");

class AuthFacade {
    async register(req, res) {
        return register(req, res);
    }

    async login(req, res) {
        return login(req, res);
    }

    async profile(req, res) {
        return getMyProfile(req, res);
    }
}

module.exports = new AuthFacade();
