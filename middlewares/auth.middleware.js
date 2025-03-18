const mongoose = require("mongoose");
const CryptoJs = require("crypto-js");
const constant = require("../config/constant");
const { Admin } = require("../models/admin.model");
const { Agent } = require("../models/agent.model");
const { FrontToken } = require("../models/front_token.model");

module.exports = {
    //For Admin Auth
    adminAuth: async (req, res, next) => {
        let adminId = req.session.adminId;
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            await req.session.destroy();
            return res.redirect("/v1/admin");
        }
        let adminData = await Admin.findOne({ _id: adminId, isDeleted: 0, status: true });
        if (!adminData) {
            await req.session.destroy();
            return res.redirect("/v1/admin");
        }
        req.session.name = adminData.name;
        req.session.image = adminData.image;
        next();
    },
    adminLoginAuth: async (req, res, next) => {
        let adminId = req.session.adminId;
        if (adminId) {
            return res.redirect("/v1/admin/dashboard");
        }
        next();
    },

    //For Agent Auth
    agentAuth: async (req, res, next) => {
        let agentId = req.session.agentId;
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            await req.session.destroy();
            return res.redirect("/v1/agent");
        }
        let agentData = await Agent.findOne({ _id: agentId, isDeleted: 0, status: true, profileStatus: "Approved" });
        if (!agentData) {
            await req.session.destroy();
            return res.redirect("/v1/agent");
        }
        req.session.name = agentData.name;
        req.session.image = agentData.image;
        next();
    },
    agentLoginAuth: async (req, res, next) => {
        let agentId = req.session.agentId;
        if (agentId) {
            return res.redirect("/v1/agent/dashboard");
        }
        next();
    },

    //For Api Auth
    // apiAuth: async (req, res, next) => {
    //     const originUrl = req.headers.referer || (req.headers.origin ? req.headers.origin + "/" : "");
    //     if (originUrl == constant.DATA.FRONTEND_URL + "/" || originUrl == constant.DATA.WWWFRONTEND_URL + "/" || originUrl == "http://localhost:3000/" || originUrl == "http://www.localhost:3000/") {
    //         let token = req.headers.authorization;
    //         if (!token) {
    //             return res.status(200).json({
    //                 status: "error",
    //                 message: "Authorization token missing.",
    //                 data: {}
    //             });
    //         }
    //         if (await FrontToken.findOne({ token })) {
    //             return res.status(200).json({
    //                 status: "error",
    //                 message: "Authorization token are already used. Please refresh the page and try again.",
    //                 data: {}
    //             });
    //         }
    //         const bytes = CryptoJs.AES.decrypt(token, constant.SECRETCONFIG.FRONT_SECRET_KEY);
    //         if (!bytes.toString(CryptoJs.enc.Utf8)) {
    //             return res.status(200).json({
    //                 status: "error",
    //                 message: "Invalid authorization token.",
    //                 data: {}
    //             });
    //         }
    //         const decryptedData = JSON.parse(bytes.toString(CryptoJs.enc.Utf8));
    //         if (!new Date(decryptedData?.generateTokenTime)) {
    //             return res.status(200).json({
    //                 status: "error",
    //                 message: "Invalid authorization token.",
    //                 data: {}
    //             });
    //         }
    //         let date = new Date();
    //         date.setHours(date.getHours - 6);
    //         if (new Date(decryptedData.generateTokenTime) < date) {
    //             return res.status(200).json({
    //                 status: "error",
    //                 message: "Authorization token has been Expired.",
    //                 data: {}
    //             });
    //         }
    //         await FrontToken({ token }).save();
    //         next();
    //     } else {
    //         return res.status(200).json({
    //             status: "error",
    //             message: "Invalid request.",
    //             data: {}
    //         });
    //     }
    // }
    apiAuth:(req, res, next)=>{
        next();
    }
}