// middleware/loggerMiddleware.js
function loggerMiddleware(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next(); // pass control
}

module.exports = loggerMiddleware;
