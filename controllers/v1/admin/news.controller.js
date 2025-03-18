const moment = require("moment");
const mongoose = require("mongoose");
const { v4 } = require("uuid");
const constant = require("../../../config/constant");
const { News, newsValidate } = require("../../../models/news.model");

module.exports = {
    index: async (req, res) => {
        let title = "News";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "News", url: "/v1/admin/manage_news" }
        ];
        return res.render("v1/admin/news/view", { layout: "v1/admin/layout", title, BREADCRUMB });
    },
    list: async (req, res) => {
        let search = { isDeleted: 0 };
        let searchVal = req.body.search.value;
        if (searchVal) {
            search.title = { $regex: searchVal, $options: "i" };
        }
        let skip = +req.body.start || 0;
        let limit = +req.body.length || +constant.DATA.LIMIT;
        let sort = { createdAt: -1 };
        let totalCount = await News.countDocuments(search);
        let data = await News.find(search).collation({ locale: "en" }).sort(sort).skip(skip).limit(limit);
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalCount;
        obj.recordsFiltered = totalCount;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            arr1.push(`<img src="${dt.image ? constant.DATA.SHOWNEWSPATH + dt.image : constant.DATA.NOPROFILE}" height="50">`);
            arr1.push(dt.title);
            arr1.push(moment(dt.createdAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(moment(dt.updatedAt).format(constant.DATA.DEFAULTDATEFORMAT));
            let status = '';
            if (dt.status) {
                status = `<a href="javascript:void(0)" class="badge badge-success" onclick="changeStatus('${dt._id}')">Active</a>`;
            } else {
                status = `<a href="javascript:void(0)" class="badge badge-danger" onclick="changeStatus('${dt._id}')">Inactive</a>`;
            }
            arr1.push(status);
            arr1.push(`<a href="/v1/admin/manage_news/edit/${dt._id}" class="btn btn-outline-primary" title="Edit"><i class="fas fa-edit"></i></a> <a class="btn btn-outline-danger" onclick="deleteRecord('${dt._id}')" title="Delete"><i class="fas fa-trash"></i></a>`);
            arr.push(arr1)
        }
        obj.data = arr;
        return res.send(obj)
    },
    add: async (req, res) => {
        if (req.method == "POST") {
            const { error } = newsValidate(req.body);
            if (error) {
                req.flash("message", { message: error.details[0].message, status: false });
                return res.redirect("/v1/admin/manage_news/add");
            }
            let { newsTitle, content } = req.body;
            if (await News.findOne({ title: newsTitle, isDeleted: 0 })) {
                req.flash("message", { message: "This news title are already exist.", status: false });
                return res.redirect("/v1/admin/manage_news/add");
            }
            let image = "";
            if (req.files && req.files.image) {
                image = v4() + "_" + req.files.image.name;
                await req.files.image.mv(constant.DATA.UPLOADNEWSPATH + image);
            }
            await new News({
                title: newsTitle,
                image,
                content
            }).save();
            req.flash("message", { message: "Successfully Save Record.", status: true });
            return res.redirect("/v1/admin/manage_news");
        } else {
            let title = "News | Add";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "News", url: "/v1/admin/manage_news" },
                { title: "Add", url: "/v1/admin/manage_news/add" }
            ];
            return res.render("v1/admin/news/add", { layout: "v1/admin/layout", title, BREADCRUMB, data: {} });
        }
    },
    edit: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/admin/manage_news");
        }
        let record = await News.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/manage_news");
        }
        if (req.method == "POST") {
            const { error } = newsValidate(req.body);
            if (error) {
                req.flash("message", { message: error.details[0].message, status: false });
                return res.redirect("/v1/admin/manage_news/edit/" + id);
            }
            let { newsTitle, content } = req.body;
            if (await News.findOne({ title: newsTitle, isDeleted: 0, _id: { $ne: id } })) {
                req.flash("message", { message: "This news title are already exist.", status: false });
                return res.redirect("/v1/admin/manage_news/edit/" + id);
            }
            let obj = {
                title: newsTitle,
                content
            }
            if (req.files && req.files.image) {
                obj.image = v4() + "_" + req.files.image.name;
                await req.files.image.mv(constant.DATA.UPLOADNEWSPATH + obj.image);
            }
            let updateRec = await News.findByIdAndUpdate(id, obj);
            if (!updateRec) {
                req.flash("message", { message: "Your record is not update properly. please try again.", status: false });
                return res.redirect("/v1/admin/manage_news/edit/" + id);
            } else {
                req.flash("message", { message: "Successfully Update Record.", status: true });
                return res.redirect("/v1/admin/manage_news");
            }
        } else {
            let title = "News | Edit";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "News", url: "/v1/admin/manage_news" },
                { title: "Edit", url: "/v1/admin/manage_news/edit/" + id }
            ];
            return res.render("v1/admin/news/add", { layout: "v1/admin/layout", title, BREADCRUMB, data: record });
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
        let record = await News.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await News.findByIdAndUpdate(id, { status: record.status ? false : true });
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
        let record = await News.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await News.findByIdAndUpdate(id, { isDeleted: 1 });
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