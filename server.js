const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

// Encapsulation: wrap the entire server in a class
class AppServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 5000;
        this.dbUri = process.env.MONGO_URI;

        this.middlewares();
        this.routes();
    }

    // Encapsulation: keep middleware config private
    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    routes() {
        this.app.use("/api/auth", require("./routes/authRoutes"));
        this.app.use("/api/candidate", require("./routes/candidateRoutes"));
        // this.app.use("/api/vote", require("./routes/voteRoutes"));
        // this.app.use("/api/election", require("./routes/electionRoutes"));
        // this.app.use("/api/result", require("./routes/resultRoutes"));
    }

    async connectDB() {
        try {
            console.log(process.env.MONGO_URI);
            await mongoose.connect(this.dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log("MongoDB connected");
        } catch (error) {
            console.error("MongoDB connection error:", error.message);
            process.exit(1);
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Server running on port ${this.port}`);
        });
    }

    getApp() {
        return this.app; // useful for testing
    }
}


const server = new AppServer();

// Run only if called directly
if (require.main === module) {
    server.connectDB().then(() => server.start());
}

module.exports = server.getApp();
