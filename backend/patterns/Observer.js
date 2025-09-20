const fs = require("fs");
const path = require("path");

class LogObserver {
    update(data) {
        const logsDir = path.join(__dirname, "../logs");
        const logPath = path.join(logsDir, "votes.log");

        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        const logEntry = `[${new Date().toISOString()}] Voter ${data.voterName} voted for Candidate ${data.candidateName}\n`;

        fs.appendFileSync(logPath, logEntry, { flag: "a+" });
        console.log("LogObserver: vote written to file");
    }
}

class AdminConsoleObserver {
    update(data) {
        console.log(
            `AdminConsoleObserver: Voter ${data.voterName} just voted for Candidate ${data.candidateName}`
        );
    }
}

module.exports = { LogObserver, AdminConsoleObserver };
