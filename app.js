require("dotenv").config();
const express = require("express");
const app = express();
const constant = require("./config/constant");
const { ErrorHandler } = require("./middlewares/errorHandler");
const logger = require("./startup/logger");
global.ErrorHandler = ErrorHandler;
global.logger = logger;
require("./startup/config")(app);
require("./startup/routes_v1")(app);
app.listen(constant.SECRETCONFIG.PORT, () => {
    logger.info(`App is listen on:${constant.SECRETCONFIG.PORT}`)
});