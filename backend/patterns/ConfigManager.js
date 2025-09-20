// Singleton Pattern: Configuration Manager

require("dotenv").config();

class ConfigManager {
    constructor() {
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }

        // Configuration settings
        this.config = {
            port: process.env.PORT || 5001,
            dbUrl: process.env.MONGO_URI,
            jwtSecret: process.env.JWT_SECRET
        };

        ConfigManager.instance = this;
    }

    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    get(key) {
        return this.config[key];
    }

    getAll() {
        return this.config;
    }
}

// Export singleton instance
module.exports = ConfigManager.getInstance();
