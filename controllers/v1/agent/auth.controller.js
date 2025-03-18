const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const constant = require("../../../config/constant");
const { Agent } = require("../../../models/agent.model");
const Email = require("../../../utils/email.util");

module.exports = {
    login: async (req, res) => {
        if (req.method == "POST") {
            let { email, password } = req.body;
            let agentData = await Agent.findOne({ email: email.toLowerCase().trim(), isDeleted: 0 });
            if (!agentData) {
                req.flash("message", { message: "Invalid email id. please enter valid email id", status: false });
                return res.redirect("/v1/agent");
            }
            if (!bcrypt.compareSync(password, agentData.password)) {
                req.flash("message", { message: "Invalid password. please enter valid password", status: false });
                return res.redirect("/v1/agent");
            }
            if (!agentData.status) {
                req.flash("message", { message: "Your account is deactivated. Please contact to admin.", status: false });
                return res.redirect("/v1/agent");
            }
            if (agentData.profileStatus == "Pending") {
                req.flash("message", { message: "Your account is not approved. Please contact to admin.", status: false });
                return res.redirect("/v1/agent");
            }
            if (agentData.profileStatus == "Rejected") {
                req.flash("message", { message: "Your account is rejected. Reason is:" + (agentData.rejectReason || ''), status: false });
                return res.redirect("/v1/agent");
            }
            req.session.agentId = agentData._id;
            req.flash("message", { message: "Successfully Login.", status: true });
            return res.redirect("/v1/agent/dashboard");
        } else {
            let title = "Login";
            return res.render("v1/agent/auth/login", { layout: "v1/agent/login_layout", title })
        }
    },
    register: async (req, res) => {
        if (req.method == "POST") {
            let { name, email, mobile, password, confirmPassword, agreeTerms } = req.body;
            email = email.toLowerCase().trim();
            if (password !== confirmPassword) {
                req.flash("message", { message: "Password and confirm password should be equal", status: false });
                return res.redirect("/v1/agent/register");
            }
            if (!agreeTerms) {
                req.flash("message", { message: "Please check the terms policy.", status: false });
                return res.redirect("/v1/agent/register");
            }
            let findAgent = await Agent.findOne({ $or: [{ email }, { mobile }], isDeleted: 0 });
            if (findAgent) {
                if (findAgent.email == email) {
                    req.flash("message", { message: email + " is already register.", status: false });
                    return res.redirect("/v1/agent/register");
                } else {
                    req.flash("message", { message: mobile + " is already register.", status: false });
                    return res.redirect("/v1/agent/register");
                }
            }
            await Agent({
                name,
                email,
                mobile,
                password: bcrypt.hashSync(password)
            }).save();
            req.flash("message", { message: "Successfully register your account. please wait for admin approval.", status: true });
            return res.redirect("/v1/agent");
        } else {
            let title = "Register";
            return res.render("v1/agent/auth/register", { layout: "v1/agent/login_layout", title })
        }
    },
    forgotPassword: async (req, res) => {
        if (req.method == "POST") {
            let { email } = req.body;
            let agentData = await Agent.findOne({ email: email.toLowerCase().trim(), isDeleted: 0 });
            if (!agentData) {
                req.flash("message", { message: "Invalid email id. please enter valid email id", status: false });
                return res.redirect("/v1/agent/forgot-password");
            }
            if (!agentData.status) {
                req.flash("message", { message: "Your account is deactivated. Please contact to admin.", status: false });
                return res.redirect("/v1/agent/forgot-password");
            }
            if (agentData.profileStatus == "Pending") {
                req.flash("message", { message: "Your account is not approved. Please contact to admin.", status: false });
                return res.redirect("/v1/agent/forgot-password");
            }
            if (agentData.profileStatus == "Rejected") {
                req.flash("message", { message: "Your account is rejected. Reason is:" + (agentData.rejectReason || ''), status: false });
                return res.redirect("/v1/agent/forgot-password");
            }
            let token = jwt.sign({
                id: agentData._id,
                email: agentData.email
            }, constant.SECRETCONFIG.AGENT_FORGOT_JWT_SECRET);
            await Agent.findByIdAndUpdate(agentData._id, { token, tokenTime: new Date() });
            let resetLink = constant.DATA.SITE_URL + "/v1/agent/reset-password/" + token;
            Email.send_mail({
                to: agentData.email,
                subject: `${constant.DATA.SITENAME} forgot password mail`,
                mailData: `Your ${constant.DATA.SITENAME} forgot password link is: <a href="${resetLink}" target="_blank">Click for reset password</a>`
            });
            req.flash("message", { message: "Successfully sent reset password link on your email.", status: true });
            return res.redirect("/v1/agent/forgot-password");
        } else {
            let title = "Forgot Password";
            return res.render("v1/agent/auth/forgot_password", { layout: "v1/agent/login_layout", title })
        }
    },
    resetPassword: async (req, res) => {
        try {
            let { token } = req.params;
            let decodeToken = jwt.verify(token, constant.SECRETCONFIG.AGENT_FORGOT_JWT_SECRET);
            let { id, email } = decodeToken;
            let agentData = await Agent.findOne({ _id: id, isDeleted: 0 });
            if (!agentData) {
                req.flash("message", { message: "This account no longer exist.", status: false });
                return res.redirect("/v1/agent/forgot-password");
            }
            if (!agentData.status) {
                req.flash("message", { message: "Your account is deactivated. Please contact to admin.", status: false });
                return res.redirect("/v1/agent");
            }
            if (agentData.profileStatus == "Pending") {
                req.flash("message", { message: "Your account is not approved. Please contact to admin.", status: false });
                return res.redirect("/v1/agent");
            }
            if (agentData.profileStatus == "Rejected") {
                req.flash("message", { message: "Your account is rejected. Reason is:" + (agentData.rejectReason || ''), status: false });
                return res.redirect("/v1/agent");
            }
            if (agentData.token != token) {
                req.flash("message", { message: "Reset password link only one time usable.", status: false });
                return res.redirect("/v1/agent/forgot-password");
            }
            if ((new Date() - agentData.tokenTime) > 10 * 60 * 1000) {
                req.flash("message", { message: "Reset password link has been expired. please genrate new link", status: false });
                return res.redirect("/v1/agent/forgot-password");
            }
            if (req.method == "POST") {
                let { password, confirmPassword } = req.body;
                if (password !== confirmPassword) {
                    req.flash("message", { message: "Password and confirm password should be equal", status: false });
                    return res.redirect("/v1/agent/reset-password/" + token);
                }
                await Agent.findByIdAndUpdate(agentData._id, { password: bcrypt.hashSync(password), token: "", tokenTime: new Date() });
                Email.send_mail({
                    to: agentData.email,
                    subject: `${constant.DATA.SITENAME} successfully reset your password`,
                    mailData: `Your ${constant.DATA.SITENAME} password successfully reset.`
                });
                req.flash("message", { message: "Successfully reset password.", status: true });
                return res.redirect("/v1/agent");
            } else {
                let title = "Recover Password";
                return res.render("v1/agent/auth/recover_password", { layout: "v1/agent/login_layout", title })
            }
        } catch (e) {
            req.flash("message", { message: "This reset password link is not valid.", status: false });
            return res.redirect("/v1/agent");
        }
    },
    logout: async (req, res) => {
        await req.session.destroy();
        return res.redirect("/v1/agent");
    },
    profileUpdate: async (req, res) => {
        let id = req.session.agentId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/agent/dashboard");
        }
        let record = await Agent.findOne({ _id: id, isDeleted: 0 }, { name: 1, image: 1 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/agent/dashboard");
        }
        if (req.method == "POST") {
            let { name } = req.body;
            let updateObj = {
                name
            }
            if (req.files && req.files.image) {
                if (Array.isArray(req.files.image)) {
                    let imageName = v4() + "_" + req.files.image[0].name;
                    await req.files.image[0].mv(constant.DATA.UPLOADAGENTIMAGEPATH + imageName);
                    updateObj.image = imageName;
                } else {
                    let imageName = v4() + "_" + req.files.image.name;
                    await req.files.image.mv(constant.DATA.UPLOADAGENTIMAGEPATH + imageName);
                    updateObj.image = imageName;
                }
            }
            await Agent.findByIdAndUpdate(id, updateObj);
            req.flash("message", { message: "Successfully profile updated.", status: true });
            return res.redirect("/v1/agent/manage_profile");
        } else {
            let title = "Profile";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/agent/dashboard" },
                { title: "Profile", url: "/v1/agent/manage_profile" }
            ];
            return res.render("v1/agent/auth/profile_update", { layout: "v1/agent/layout", title, BREADCRUMB, data: record });
        }
    },
    changePassword: async (req, res) => {
        let id = req.session.agentId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/agent/dashboard");
        }
        let record = await Agent.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/agent/dashboard");
        }
        if (req.method == "POST") {
            let { old_password, new_password, confirm_password } = req.body;
            if (!bcrypt.compareSync(old_password, record.password)) {
                req.flash("message", { message: "Your old password is wrong. please enter valid password", status: false });
                return res.redirect("/v1/agent/manage_change_password");
            }
            if (new_password && new_password.length < 6) {
                req.flash("message", { message: "Your new password must be at least 6 characters long", status: false });
                return res.redirect("/v1/agent/manage_change_password");
            }
            if (new_password != confirm_password) {
                req.flash("message", { message: "New password and confirm password should be equal", status: false });
                return res.redirect("/v1/agent/manage_change_password");
            }
            await Agent.findByIdAndUpdate(id, { password: bcrypt.hashSync(new_password) });
            req.flash("message", { message: "Successfully change your password", status: true });
            return res.redirect("/v1/agent/dashboard");
        } else {
            let title = "Change Password";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/agent/dashboard" },
                { title: "Profile", url: "/v1/agent/manage_profile" },
                { title: "Change Password", url: "/v1/agent/manage_change_password" }
            ];
            return res.render("v1/agent/auth/change_password", { layout: "v1/agent/layout", title, BREADCRUMB, data: {} });
        }
    }
}