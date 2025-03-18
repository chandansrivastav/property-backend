const moment = require("moment");
const mongoose = require("mongoose");
const constant = require("../../../config/constant");
const { ContactUs, markAsCloseContactUs } = require("../../../models/contact_us.model");

module.exports = {
    index: async (req, res) => {
        let title = "Contact Us";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Contact Us", url: "/v1/admin/manage_contact_us" }
        ];
        return res.render("v1/admin/contact_us/view", { layout: "v1/admin/layout", title, BREADCRUMB });
    },
    list: async (req, res) => {
        let search = { isDeleted: 0 };
        let searchVal = req.body.search.value;
        if (searchVal) {
            search.$or = [
                { name: { $regex: searchVal, $options: "i" } },
                { email: { $regex: searchVal, $options: "i" } },
                { status: { $regex: searchVal, $options: "i" } }
            ];
        }
        let skip = +req.body.start || 0;
        let limit = +req.body.length || +constant.DATA.LIMIT;
        let sort = { createdAt: -1 };
        let totalRecords = await ContactUs.countDocuments(search);
        let data = await ContactUs.find(search).sort(sort).skip(skip).limit(limit);
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalRecords;
        obj.recordsFiltered = totalRecords;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            arr1.push(dt.name);
            arr1.push(dt.email);
            arr1.push(dt.mobile);
            arr1.push(dt.status);
            arr1.push(moment(dt.createdAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(moment(dt.updatedAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(`<a href="/v1/admin/manage_contact_us/view_details/${dt._id}" class="btn btn-outline-primary" title="View Details"><i class="fas fa-eye"></i></a>`);
            arr.push(arr1);
        }
        obj.data = arr;
        return res.send(obj)
    },
    viewDetails: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid record details. please try again.", status: false });
            return res.redirect("/v1/admin/manage_contact_us");
        }
        let record = await ContactUs.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/manage_contact_us");
        }
        if (record.status == "Pending") {
            await ContactUs.updateOne({ _id: id }, { status: "In Processing" });
        }
        let title = "Contact Us | View Details";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Contact Us", url: "/v1/admin/manage_contact_us" },
            { title: "View Details", url: "/v1/admin/manage_contact_us/view_details/" + id }
        ];
        return res.render("v1/admin/contact_us/view_details", { layout: "v1/admin/layout", title, BREADCRUMB, moment, data: record });
    },
    changeStatus: async (req, res) => {
        const { error } = markAsCloseContactUs(req.body);
        if (error) {
            return res.json({
                status: "error",
                message: error.details[0].message,
                data: {}
            })
        }
        let id = req.params.id;
        let { remarks } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: "error",
                message: "Invalid record details. please try again.",
                data: {}
            })
        }
        let record = await ContactUs.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        if (record.status == "Close") {
            return res.json({
                status: "error",
                message: "This contact query already closed.",
                data: {}
            });
        }
        let updatedRec = await ContactUs.findByIdAndUpdate(id, { status: "Close", remarks: remarks || "" });
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
    }
}