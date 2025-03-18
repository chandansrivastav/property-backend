const moment = require("moment");
const mongoose = require("mongoose");
const slugify = require("slugify");
const constant = require("../../../config/constant");
const { Category } = require("../../../models/category.model");

module.exports = {
    index: async (req, res) => {
        let title = "Category";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Category", url: "/v1/admin/manage_category" }
        ];
        return res.render("v1/admin/category/view", { layout: "v1/admin/layout", title, BREADCRUMB });
    },
    list: async (req, res) => {
        let search = { isDeleted: 0 };
        let searchVal = req.body.search.value;
        if (searchVal) {
            search.$or = [
                { name: { $regex: searchVal, $options: "i" } },
                { slug: { $regex: searchVal, $options: "i" } }
            ];
        }
        let skip = +req.body.start || 0;
        let limit = +req.body.length || +constant.DATA.LIMIT;
        let sort = { createdAt: -1 };
        let totalCount = await Category.countDocuments(search);
        let data = await Category.find(search).collation({ locale: "en" }).sort(sort).skip(skip).limit(limit);
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalCount;
        obj.recordsFiltered = totalCount;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            arr1.push(dt.name);
            arr1.push(dt.slug);
            // arr1.push(moment(dt.createdAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(moment(dt.updatedAt).format(constant.DATA.DEFAULTDATEFORMAT));
            let status = '';
            if (dt.status) {
                status = `<a href="javascript:void(0)" class="badge badge-success" onclick="changeStatus('${dt._id}')">Active</a>`;
            } else {
                status = `<a href="javascript:void(0)" class="badge badge-danger" onclick="changeStatus('${dt._id}')">Inactive</a>`;
            }
            arr1.push(status);
            arr1.push(`<a href="javascript:void(0)" class="btn btn-outline-primary" onclick="dataAddModal('${dt._id}')" title="Edit"><i class="fas fa-edit"></i></a> <a class="btn btn-outline-danger" onclick="deleteRecord('${dt._id}')" title="Delete"><i class="fas fa-trash"></i></a>`);
            arr.push(arr1)
        }
        obj.data = arr;
        return res.send(obj)
    },
    add: async (req, res) => {
        if (req.method == "POST") {
            let { name } = req.body;
            let slug = slugify(name, { replacement: "-", remove: undefined, lower: true, strict: true });
            if (await Category.findOne({ slug, isDeleted: 0 })) {
                req.flash("message", { message: "This category is already exist.", status: false });
                return res.redirect("/v1/admin/manage_category");
            }
            await new Category({
                name,
                slug
            }).save();
            req.flash("message", { message: "Successfully Save Record.", status: true });
            return res.redirect("/v1/admin/manage_category");
        } else {
            let url = "/v1/admin/manage_category/add";
            return res.render("v1/admin/category/add", { layout: false, url, data: {} });
        }
    },
    edit: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/admin/manage_category");
        }
        let record = await Category.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/manage_category");
        }
        if (req.method == "POST") {
            let { name } = req.body;
            let slug = slugify(name, { replacement: "-", remove: undefined, lower: true, strict: true });
            if (await Category.findOne({ slug, isDeleted: 0, _id: { $ne: id } })) {
                req.flash("message", { message: "This category is already exist.", status: false });
                return res.redirect("/v1/admin/manage_category");
            }
            let obj = {
                name,
                slug
            }
            let updateRec = await Category.findByIdAndUpdate(id, obj);
            if (!updateRec) {
                req.flash("message", { message: "Your record is not update properly. please try again.", status: false });
                return res.redirect("/v1/admin/manage_category");
            } else {
                req.flash("message", { message: "Successfully Update Record.", status: true });
                return res.redirect("/v1/admin/manage_category");
            }
        } else {
            let url = "/v1/admin/manage_category/edit/" + id;
            return res.render("v1/admin/category/add", { layout: false, url, data: record });
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
        let record = await Category.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await Category.findByIdAndUpdate(id, { status: record.status ? false : true });
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
        let record = await Category.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await Category.findByIdAndUpdate(id, { isDeleted: 1 });
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