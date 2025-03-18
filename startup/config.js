const express = require("express");
const session = require('express-session');
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const fileupload = require("express-fileupload");
const cors = require("cors");
const layout = require("express-layout");
require("express-async-errors");
const logger = require("./logger");
const constant = require("../config/constant");
const globalMiddleware = require("../middlewares/global.middleware");
// const scheduler = require("../utils/scheduler.util");
const MONGO_URI = constant.SECRETCONFIG.MONGO_URL + constant.SECRETCONFIG.DB_NAME;
module.exports = (app) => {
    mongoose.connect(MONGO_URI).then(() => {
        logger.info("connected to db...")
    }).catch((err) => {
        logger.error(err)
    });
    app.use(flash());
    app.use(layout());
    app.use(fileupload());
    app.use(cors());
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static("public"));
    app.use(session({
        secret: constant.SECRETCONFIG.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: { maxAge: 86400000 },
        store: MongoStore.create({
            mongoUrl: MONGO_URI
        }),
        autoRemove: 'native'
    }));
    app.use((req, res, next) => {
        res.locals.APPCONSTANT = constant.DATA;
        res.locals.message = req.flash("message");
        res.locals.COOKIES = req.cookies;
        res.locals.SESSION = req.session;
        next();
    });
    app.set("view engine", "ejs");
    app.use(globalMiddleware.fileSizeValidate);
    // scheduler.removeExpireFrontendToken();
}