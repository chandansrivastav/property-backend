const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { v4 } = require("uuid");
const constant = require("../../../config/constant");
const { Admin } = require("../../../models/admin.model");

module.exports = {
    login: async (req, res) => {
        if (req.method == "POST") {
            let { email, password } = req.body;
            let adminData = await Admin.findOne({ email: email.toLowerCase().trim(), isDeleted: 0 });
            if (!adminData) {
                req.flash("message", { message: "Invalid email id. please enter valid email id", status: false });
                return res.redirect("/v1/admin");
            }
            if (!bcrypt.compareSync(password, adminData.password)) {
                req.flash("message", { message: "Invalid password. please enter valid password", status: false });
                return res.redirect("/v1/admin");
            }
            if (!adminData.status) {
                req.flash("message", { message: "Your account is deactivated", status: false });
                return res.redirect("/v1/admin");
            }
            req.session.adminId = adminData._id;
            req.flash("message", { message: "Successfully Login.", status: true });
            return res.redirect("/v1/admin/dashboard");
        } else {
            let title = "Login";
            return res.render("v1/admin/auth/login", { layout: "v1/admin/login_layout", title })
        }
    },
    logout: async (req, res) => {
        await req.session.destroy();
        return res.redirect("/v1/admin");
    },
    profileUpdate: async (req, res) => {
        let id = req.session.adminId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/admin/dashboard");
        }
        let record = await Admin.findOne({ _id: id, isDeleted: 0 }, { name: 1, image: 1 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/dashboard");
        }
        if (req.method == "POST") {
            let { name } = req.body;
            let updateObj = {
                name
            }
            if (req.files && req.files.image) {
                if (Array.isArray(req.files.image)) {
                    let imageName = v4() + "_" + req.files.image[0].name;
                    await req.files.image[0].mv(constant.DATA.UPLOADADMINIMAGEPATH + imageName);
                    updateObj.image = imageName;
                } else {
                    let imageName = v4() + "_" + req.files.image.name;
                    await req.files.image.mv(constant.DATA.UPLOADADMINIMAGEPATH + imageName);
                    updateObj.image = imageName;
                }
            }
            await Admin.findByIdAndUpdate(id, updateObj);
            req.flash("message", { message: "Successfully profile updated.", status: true });
            return res.redirect("/v1/admin/manage_profile");
        } else {
            let title = "Profile";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "Profile", url: "/v1/admin/manage_profile" }
            ];
            return res.render("v1/admin/auth/profile_update", { layout: "v1/admin/layout", title, BREADCRUMB, data: record });
        }
    },
    changePassword: async (req, res) => {
        let id = req.session.adminId;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/admin/dashboard");
        }
        let record = await Admin.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/dashboard");
        }
        if (req.method == "POST") {
            let { old_password, new_password, confirm_password } = req.body;
            if (!bcrypt.compareSync(old_password, record.password)) {
                req.flash("message", { message: "Your old password is wrong. please enter valid password", status: false });
                return res.redirect("/v1/admin/manage_change_password");
            }
            if (new_password && new_password.length < 6) {
                req.flash("message", { message: "Your new password must be at least 6 characters long", status: false });
                return res.redirect("/v1/admin/manage_change_password");
            }
            if (new_password != confirm_password) {
                req.flash("message", { message: "New password and confirm password should be equal", status: false });
                return res.redirect("/v1/admin/manage_change_password");
            }
            await Admin.findByIdAndUpdate(id, { password: bcrypt.hashSync(new_password) });
            req.flash("message", { message: "Successfully change your password", status: true });
            return res.redirect("/v1/admin/dashboard");
        } else {
            let title = "Change Password";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "Profile", url: "/v1/admin/manage_profile" },
                { title: "Change Password", url: "/v1/admin/manage_change_password" }
            ];
            return res.render("v1/admin/auth/change_password", { layout: "v1/admin/layout", title, BREADCRUMB, data: {} });
        }
    }
}