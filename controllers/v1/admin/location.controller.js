const moment = require("moment");
const mongoose = require("mongoose");
const { v4 } = require("uuid");
const constant = require("../../../config/constant");
const { Location } = require("../../../models/location.model");

module.exports = {
    index: async (req, res) => {
        let title = "Location";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Location", url: "/v1/admin/manage_location" }
        ];
        return res.render("v1/admin/location/view", { layout: "v1/admin/layout", title, BREADCRUMB });
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
        let totalCount = await Location.countDocuments(search);
        let data = await Location.find(search).collation({ locale: "en" }).sort(sort).skip(skip).limit(limit);
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalCount;
        obj.recordsFiltered = totalCount;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            arr1.push(`<img src="${dt.image ? constant.DATA.SHOWLOCATIONPATH + dt.image : constant.DATA.NOPROFILE}" height="50">`);
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
            arr1.push(`<a href="/v1/admin/manage_location/edit/${dt._id}" class="btn btn-outline-primary" title="Edit"><i class="fas fa-edit"></i></a> <a class="btn btn-outline-danger" onclick="deleteRecord('${dt._id}')" title="Delete"><i class="fas fa-trash"></i></a>`);
            arr.push(arr1)
        }
        obj.data = arr;
        return res.send(obj)
    },
    add: async (req, res) => {
        if (req.method == "POST") {
            let { name, orderBy } = req.body;
            if (await Location.findOne({ name, isDeleted: 0 })) {
                req.flash("message", { message: "This location is already exist.", status: false });
                return res.redirect("/v1/admin/manage_location/add");
            }
            let image = "";
            if (req.files && req.files.image) {
                image = v4() + "_" + req.files.image.name;
                await req.files.image.mv(constant.DATA.UPLOADLOCATIONPATH + image);
            }
            await new Location({
                name,
                orderBy: +orderBy || 0,
                image
            }).save();
            req.flash("message", { message: "Successfully Save Record.", status: true });
            return res.redirect("/v1/admin/manage_location");
        } else {
            let title = "Location | Add";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "Location", url: "/v1/admin/manage_location" },
                { title: "Add", url: "/v1/admin/manage_location/add" }
            ];
            return res.render("v1/admin/location/add", { layout: "v1/admin/layout", title, BREADCRUMB, data: {} });
        }
    },
    edit: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/admin/manage_location");
        }
        let record = await Location.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/manage_location");
        }
        if (req.method == "POST") {
            let { name, orderBy } = req.body;
            if (await Location.findOne({ name, isDeleted: 0, _id: { $ne: id } })) {
                req.flash("message", { message: "This location is already exist.", status: false });
                return res.redirect("/v1/admin/manage_location/edit/" + id);
            }
            let obj = {
                name,
                orderBy: +orderBy || 0,
            }
            if (req.files && req.files.image) {
                obj.image = v4() + "_" + req.files.image.name;
                await req.files.image.mv(constant.DATA.UPLOADLOCATIONPATH + obj.image);
            }
            let updateRec = await Location.findByIdAndUpdate(id, obj);
            if (!updateRec) {
                req.flash("message", { message: "Your record is not update properly. please try again.", status: false });
                return res.redirect("/v1/admin/manage_location/edit/" + id);
            } else {
                req.flash("message", { message: "Successfully Update Record.", status: true });
                return res.redirect("/v1/admin/manage_location");
            }
        } else {
            let title = "Location | Edit";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/admin/dashboard" },
                { title: "Location", url: "/v1/admin/manage_location" },
                { title: "Edit", url: "/v1/admin/manage_location/edit/" + id }
            ];
            return res.render("v1/admin/location/add", { layout: "v1/admin/layout", title, BREADCRUMB, data: record });
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
        let record = await Location.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await Location.findByIdAndUpdate(id, { status: record.status ? false : true });
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
        let record = await Location.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        let updatedRec = await Location.findByIdAndUpdate(id, { isDeleted: 1 });
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