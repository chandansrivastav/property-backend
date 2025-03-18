const fs = require("fs");
const moment = require("moment");
const mongoose = require("mongoose");
const { v4 } = require("uuid");
const constant = require("../../../config/constant");
const { StaticImage } = require("../../../models/static_images.model");

module.exports = {
    index: async (req, res) => {
        let title = "Static Images";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Static Images", url: "/v1/admin/manage_static_image" }
        ];
        return res.render("v1/admin/static_images/view", { layout: "v1/admin/layout", title, BREADCRUMB });
    },
    list: async (req, res) => {
        let search = { isDeleted: 0 };
        let searchVal = req.body.search.value;
        if (searchVal) {
            search.$or = [
                { name: { $regex: searchVal, $options: "i" } }
            ];
        }
        let skip = +req.body.start || 0;
        let limit = +req.body.length || +constant.DATA.LIMIT;
        let sort = { createdAt: -1 };
        let totalCount = await StaticImage.countDocuments(search);
        let data = await StaticImage.find(search).collation({ locale: "en" }).sort(sort).skip(skip).limit(limit);
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalCount;
        obj.recordsFiltered = totalCount;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            arr1.push(`<img src="${dt.name ? constant.DATA.SHOWSTATICIMAGEPATH + dt.name : constant.DATA.NOIMAGE}" height="50">`);
            arr1.push(`<a href="${dt.name ? constant.DATA.SHOWSTATICIMAGEPATH + dt.name : constant.DATA.NOIMAGE}" target="_blank">${dt.name ? constant.DATA.SITE_URL + constant.DATA.SHOWSTATICIMAGEPATH + dt.name : constant.DATA.NOIMAGE}</a>`);
            arr1.push(moment(dt.createdAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(`<a class="btn btn-outline-secondary" onclick="copyText('${dt.name ? constant.DATA.SITE_URL + constant.DATA.SHOWSTATICIMAGEPATH + dt.name : constant.DATA.NOIMAGE}')" title="Copy"><i class="fas fa-file"></i></a> <a class="btn btn-outline-danger" onclick="deleteRecord('${dt._id}')" title="Delete"><i class="fas fa-trash"></i></a>`);
            arr.push(arr1);
        }
        obj.data = arr;
        return res.send(obj)
    },
    add: async (req, res) => {
        if (req.method == "POST") {
            if (!req?.files?.image) {
                req.flash("message", { message: "Please select image.", status: false });
                return res.redirect("/v1/admin/manage_static_image");
            }
            let name = "";
            if (Array.isArray(req?.files?.image)) {
                name = v4() + "_" + req.files.image[0].name;
                await req.files.image[0].mv(constant.DATA.UPLOADSTATICIMAGEPATH + name);
            } else {
                name = v4() + "_" + req.files.image.name;
                await req.files.image.mv(constant.DATA.UPLOADSTATICIMAGEPATH + name);
            }
            await new StaticImage({
                name
            }).save();
            req.flash("message", { message: "Successfully Save Record.", status: true });
            return res.redirect("/v1/admin/manage_static_image");
        } else {
            let url = "/v1/admin/manage_static_image/add";
            return res.render("v1/admin/static_images/add", { layout: false, url, data: {} });
        }
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
        let record = await StaticImage.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            });
        }
        let updatedRec = await StaticImage.findByIdAndDelete(id);
        fs.unlinkSync(constant.DATA.UPLOADSTATICIMAGEPATH + record.name)
        if (!updatedRec) {
            return res.json({
                status: "error",
                message: "Your record is not delete properly. please try again.",
                data: {}
            });
        }
        return res.json({
            status: "success",
            message: "Successfully delete record.",
            data: {}
        })
    }
}