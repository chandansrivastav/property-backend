const logger = require("../startup/logger");

module.exports.errorHandler = async (err, req, res, next) => {
    const { statusCode, message } = err;
    logger.error(message)
    return res.status(statusCode || 500).json({
        status: "error",
        message: message || "Something went wrong on server.",
        data: {}
    });
}

module.exports.invalidRoutes = async (req, res) => {
    throw new ErrorHandler(404, "End point not found");
}

module.exports.adminInvalidRoutes = async (req, res) => {
    return res.redirect("/v1/admin/404");
}

module.exports.agentInvalidRoutes = async (req, res) => {
    return res.redirect("/v1/agent/404");
}

module.exports.frontInvalidRoutes = async (req, res) => {
    return res.status(200).json({
        status: "error",
        message: "Invalid api url.",
        data: {}
    });
}

class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports.ErrorHandler = ErrorHandler