const moment = require("moment");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { v4 } = require("uuid");
const constant = require("../../../config/constant");
const { Agent, addAgentValidation, editAgentValidation } = require("../../../models/agent.model");

module.exports = {
    index: async (req, res) => {
        let title = "Agent";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Agent", url: "/v1/admin/manage_agent" }
        ];
        return res.render("v1/admin/agent/view", { layout: "v1/admin/layout", title, BREADCRUMB });
    },
    list: async (req, res) => {
        let search = { isDeleted: 0 };
        let searchVal = req.body.search.value;
        if (searchVal) {
            search.$or = [
                { name: { $regex: searchVal, $options: "i" } },
                { email: { $regex: searchVal, $options: "i" } },
                { mobile: { $regex: searchVal, $options: "i" } },
            ];
        }
        let skip = +req.body.start || 0;
        let limit = +req.body.length || +constant.DATA.LIMIT;
        let sort = { createdAt: -1 };
        let totalRecords = await Agent.countDocuments(search);
        let data = await Agent.find(search).sort(sort).skip(skip).limit(limit);
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalRecords;
        obj.recordsFiltered = totalRecords;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            arr1.push(`<img src="${(dt.image) ? constant.DATA.SHOWAGENTIMAGEPATH + dt.image : constant.DATA.NOPROFILE}" height="50">`);
            arr1.push(dt.name);
            arr1.push(dt.email);
            arr1.push(dt.mobile);
            arr1.push(moment(dt.createdAt).format(constant.DATA.DEFAULTDATEFORMAT));
            let status = '';
            if (dt.status) {
                status = `<a href="javascript:void(0)" class="badge badge-success" onclick="changeStatus('${dt._id}')">Active</a>`;
            } else {
                status = `<a href="javascript:void(0)" class="badge badge-danger" onclick="changeStatus('${dt._id}')">Inactive</a>`;
            }
            arr1.push(status);
            arr1.push(`<a href="/v1/admin/manage_agent/edit/${dt._id}" class="btn btn-outline-primary" title="Edit"><i class="fas fa-edit"></i></a> <a href="/v1/admin/manage_agent/view_details/${dt._id}" class="btn btn-outline-primary" title="View Details"><i class="fas fa-eye"></i></a> <a class="btn btn-outline-danger" onclick="deleteRecord('${dt._id}')" title="Delete"><i class="fas fa-trash"></i></a>`);
            arr.push(arr1)
        }
        obj.data = arr;
        return res.send(obj)
    },
    add: async (req, res) => {
        if (req.method == "POST") {
            const { error } = addAgentValidation(req.body);
            if (error) {
                req.flash("message", { message: error.details[0].message, status: false });
                return res.redirect("/v1/admin/manage_agent/add");
            }
            let { name, email, mobile, password } = req.body;
            email = email.toLowerCase().trim();
            let findAgent = await Agent.findOne({ $or: [{ email }, { mobile }], isDeleted: 0 });
            if (findAgent) {
                if (findAgent.email == email) {
                    req.flash("message", { message: email + " is already register.", status: false });
                    return res.redirect("/v1/admin/manage_agent/add");
                } else {
                    req.flash("message", { message: mobile + " is already register.", status: false });
                    return res.redirect("/v1/admin/manage_agent/add");
                }
            }
            let image = "";
            if (req.files && req.files.image) {
                if (Array.isArray(req.files.image)) {
                    let imageName = v4() + "_" + req.files.image[0].name;
                    await req.files.image[0].mv(constant.DATA.UPLOADAGENTIMAGEPATH + imageName);
                    image = imageName;
                } else {
                    let imageName = v4() + "_" + req.files.image.name;
                    await req.files.image.mv(constant.DATA.UPLOADAGENTIMAGEPATH + imageName);
                    image = imageName;
                }
            }
            await new Agent({
                name,
                email,
                mobile,
                password: bcrypt.hashSync(password),
                image,
                profileStatus: "Approved"
            }).save();
            req.flash("message", { message: "Successfully create record.", status: true });
            return res.redirect("/v1/admin/manage_agent");
        } else {
            let title = "Agent | Add";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "Agent", url: "/v1/admin/manage_agent" },
                { title: "Add", url: "/v1/admin/manage_agent/add" }
            ];
            return res.render("v1/admin/agent/add", { layout: "v1/admin/layout", title, BREADCRUMB, data: {} });
        }
    },
    edit: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/admin/manage_agent");
        }
        let record = await Agent.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/manage_agent");
        }
        if (req.method == "POST") {
            const { error } = editAgentValidation(req.body);
            if (error) {
                req.flash("message", { message: error.details[0].message, status: false });
                return res.redirect("/v1/admin/manage_agent/edit/" + id);
            }
            let { name, email, mobile, password } = req.body;
            let findAgent = await Agent.findOne({ $or: [{ email }, { mobile }], isDeleted: 0, _id: { $ne: id } });
            if (findAgent) {
                if (findAgent.email == email) {
                    req.flash("message", { message: email + " is already register.", status: false });
                    return res.redirect("/v1/admin/manage_agent/add");
                } else {
                    req.flash("message", { message: mobile + " is already register.", status: false });
                    return res.redirect("/v1/admin/manage_agent/add");
                }
            }
            let obj = {
                name,
                email,
                mobile
            };
            if (password && password.length >= 6) {
                obj.password = bcrypt.hashSync(password);
            }
            if (req.files && req.files.image) {
                if (Array.isArray(req.files.image)) {
                    let imageName = v4() + "_" + req.files.image[0].name;
                    await req.files.image[0].mv(constant.DATA.UPLOADAGENTIMAGEPATH + imageName);
                    obj.image = imageName;
                } else {
                    let imageName = v4() + "_" + req.files.image.name;
                    await req.files.image.mv(constant.DATA.UPLOADAGENTIMAGEPATH + imageName);
                    obj.image = imageName;
                }
            }
            let updateRec = await Agent.findByIdAndUpdate(id, obj);
            if (!updateRec) {
                req.flash("message", { message: "Your record is not update properly. please try again.", status: false });
                return res.redirect("/v1/admin/manage_agent/edit/" + id);
            }
            req.flash("message", { message: "Successfully Update Record.", status: true });
            return res.redirect("/v1/admin/manage_agent");
        } else {
            let title = "Agent | Edit";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "Agent", url: "/v1/admin/manage_agent" },
                { title: "Edit", url: "/v1/admin/manage_agent/edit/" + id }
            ];
            return res.render("v1/admin/agent/add", { layout: "v1/admin/layout", title, BREADCRUMB, data: record });
        }
    },
    viewDetails: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid record details. please try again.", status: false });
            return res.redirect("/v1/admin/manage_agent");
        }
        let record = await Agent.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/manage_agent");
        }
        let title = "Agent | View Details";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Agent", url: "/v1/admin/manage_agent" },
            { title: "View Details", url: "/v1/admin/manage_agent/view_details/" + id }
        ];
        return res.render("v1/admin/agent/view_details", { layout: "v1/admin/layout", title, BREADCRUMB, moment, data: record });

    },
    changeStatus: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: "error",
                message: "Invalid record details. please try again.",
                data: {}
            })
        }
        let record = await Agent.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await Agent.findByIdAndUpdate(id, { status: record.status ? false : true });
        if (!updatedRec) {
            return res.json({
                status: "error",
                message: "Your record status is not change properly. please try again.",
                data: {}
            })
        }
        return res.json({
            status: "success",
            message: "Successfully changed status.",
            data: {}
        })
    },
    delete: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: "error",
                message: "Invalid record details. please try again.",
                data: {}
            })
        }
        let record = await Agent.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await Agent.findByIdAndUpdate(id, { isDeleted: 1 });
        if (!updatedRec) {
            return res.json({
                status: "error",
                message: "Your record is not delete properly. please try again.",
                data: {}
            })
        }
        return res.json({
            status: "success",
            message: "Successfully delete record.",
            data: {}
        })
    },
    verifyAgent: async (req, res) => {
        let { id, status, reason } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: "error",
                message: "Invalid record details. please try again.",
                data: {}
            })
        }
        let record = await Agent.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        if (record.profileStatus == "Approved") {
            return res.json({
                status: "error",
                message: "You already verified this agent.",
                data: {}
            });
        }
        let updatedRec = await Agent.findByIdAndUpdate(id, { profileStatus: status, rejectReason: reason || "" });
        if (!updatedRec) {
            return res.json({
                status: "error",
                message: "Your record is not update properly. please try again.",
                data: {}
            })
        }
        if (status == "Approved") {
            return res.json({
                status: "success",
                message: "Successfully approved agent.",
                data: {}
            });
        } else {
            return res.json({
                status: "success",
                message: "Successfully rejected agent.",
                data: {}
            });
        }
    }
}