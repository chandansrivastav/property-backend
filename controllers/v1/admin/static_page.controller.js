const moment = require("moment");
const mongoose = require("mongoose");
const constant = require("../../../config/constant");
const { StaticPage, staticPageValidate } = require("../../../models/static_page.model");

module.exports = {
    index: async (req, res) => {
        let title = "Static page";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Static Page", url: "/v1/admin/manage_static_page" }
        ];
        return res.render("v1/admin/static_page/view", { layout: "v1/admin/layout", title, BREADCRUMB });
    },
    list: async (req, res) => {
        let search = { isDeleted: 0 };
        let searchVal = req.body.search.value;
        if (searchVal) {
            search.name = { $regex: searchVal, $options: "i" };
        }
        let skip = +req.body.start || 0;
        let limit = +req.body.length || +constant.DATA.LIMIT;
        let sort = { createdAt: -1 };
        let totalCount = await StaticPage.countDocuments(search);
        let data = await StaticPage.find(search).collation({ locale: "en" }).sort(sort).skip(skip).limit(limit);
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalCount;
        obj.recordsFiltered = totalCount;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            arr1.push(dt.name);
            arr1.push(moment(dt.createdAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(moment(dt.updatedAt).format(constant.DATA.DEFAULTDATEFORMAT));
            let status = '';
            if (dt.status) {
                status = `<a href="javascript:void(0)" class="badge badge-success" onclick="changeStatus('${dt._id}')">Active</a>`;
            } else {
                status = `<a href="javascript:void(0)" class="badge badge-danger" onclick="changeStatus('${dt._id}')">Inactive</a>`;
            }
            arr1.push(status);
            arr1.push(`<a href="/v1/admin/manage_static_page/edit/${dt._id}" class="btn btn-outline-primary" title="Edit"><i class="fas fa-edit"></i></a> <a class="btn btn-outline-danger" onclick="deleteRecord('${dt._id}')" title="Delete"><i class="fas fa-trash"></i></a>`);
            arr.push(arr1)
        }
        obj.data = arr;
        return res.send(obj)
    },
    add: async (req, res) => {
        if (req.method == "POST") {
            const { error } = staticPageValidate(req.body);
            if (error) {
                req.flash("message", { message: error.details[0].message, status: false });
                return res.redirect("/v1/admin/manage_static_page/add");
            }
            let { name, content } = req.body;
            if (await StaticPage.findOne({ name, isDeleted: 0 })) {
                req.flash("message", { message: "This static page are already exist.", status: false });
                return res.redirect("/v1/admin/manage_static_page/add");
            }
            await new StaticPage({
                name,
                content
            }).save();
            req.flash("message", { message: "Successfully Save Record.", status: true });
            return res.redirect("/v1/admin/manage_static_page");
        } else {
            let title = "Static page | Add";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "Static Page", url: "/v1/admin/manage_static_page" },
                { title: "Add", url: "/v1/admin/manage_static_page/add" }
            ];
            return res.render("v1/admin/static_page/add", { layout: "v1/admin/layout", title, BREADCRUMB, data: {} });
        }
    },
    edit: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/admin/manage_static_page");
        }
        let record = await StaticPage.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/manage_static_page");
        }
        if (req.method == "POST") {
            const { error } = staticPageValidate(req.body);
            if (error) {
                req.flash("message", { message: error.details[0].message, status: false });
                return res.redirect("/v1/admin/manage_static_page/edit/" + id);
            }
            let { name, content } = req.body;
            if (await StaticPage.findOne({ name, isDeleted: 0, _id: { $ne: id } })) {
                req.flash("message", { message: "This static page are already exist.", status: false });
                return res.redirect("/v1/admin/manage_static_page/edit/" + id);
            }
            let updateRec = await StaticPage.findByIdAndUpdate(id, {
                name,
                content
            })
            if (!updateRec) {
                req.flash("message", { message: "Your record is not update properly. please try again.", status: false });
                return res.redirect("/v1/admin/manage_static_page/edit/" + id);
            } else {
                req.flash("message", { message: "Successfully Update Record.", status: true });
                return res.redirect("/v1/admin/manage_static_page");
            }
        } else {
            let title = "Static page | Edit";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "Static Page", url: "/v1/admin/manage_static_page" },
                { title: "Edit", url: "/v1/admin/manage_static_page/edit/" + id }
            ];
            return res.render("v1/admin/static_page/add", { layout: "v1/admin/layout", title, BREADCRUMB, data: record });
        }
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
        let record = await StaticPage.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await StaticPage.findByIdAndUpdate(id, { status: record.status ? false : true });
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
        let record = await StaticPage.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await StaticPage.findByIdAndUpdate(id, { isDeleted: 1 });
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
    }
}