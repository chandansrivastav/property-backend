const moment = require("moment");
const mongoose = require("mongoose");
const constant = require("../../../config/constant");
const { Property } = require("../../../models/property.model");
const { PropertyRequest } = require("../../../models/property_request.model");

module.exports = {
    index: async (req, res) => {
        let title = "Property Request";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Property Request", url: "/v1/admin/manage_property_request" }
        ];
        return res.render("v1/admin/property_request/view", { layout: "v1/admin/layout", title, BREADCRUMB });
    },
    list: async (req, res) => {
        let search = { isDeleted: 0 };
        let searchVal = req.body.search.value;
        if (searchVal) {
            search.$or = [
                { name: { $regex: searchVal, $options: "i" } },
                { email: { $regex: searchVal, $options: "i" } },
                { mobile: { $regex: searchVal, $options: "i" } },
                { status: { $regex: searchVal, $options: "i" } },
                { "propertyData.title": { $regex: searchVal, $options: "i" } }
            ];
        }
        let skip = +req.body.start || 0;
        let limit = +req.body.length || +constant.DATA.LIMIT;
        let sort = { createdAt: -1 };
        let totalRecords = await PropertyRequest.aggregate([
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "propertyData"
                }
            },
            {
                $lookup: {
                    from: "admins",
                    localField: "propertyData.agentId",
                    foreignField: "_id",
                    as: "adminData"
                }
            },
            {
                $lookup: {
                    from: "agents",
                    localField: "propertyData.agentId",
                    foreignField: "_id",
                    as: "agentData"
                }
            },
            { $match: search }
        ]);
        let data = await PropertyRequest.aggregate([
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "propertyData"
                }
            },
            {
                $lookup: {
                    from: "admins",
                    localField: "propertyData.agentId",
                    foreignField: "_id",
                    as: "adminData"
                }
            },
            {
                $lookup: {
                    from: "agents",
                    localField: "propertyData.agentId",
                    foreignField: "_id",
                    as: "agentData"
                }
            },
            { $match: search },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
        ]);
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalRecords?.length || 0;
        obj.recordsFiltered = totalRecords?.length || 0;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            let propertyDetails = `<a href="/v1/admin/manage_property/view_details/${dt.propertyId}" target="_blank">${dt.propertyData[0]?.title}</a>`
            arr1.push(propertyDetails);
            arr1.push(dt.name);
            arr1.push(dt.email);
            arr1.push(dt.mobile);
            arr1.push(moment(dt.req_date).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(dt.status);
            arr1.push(moment(dt.createdAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(moment(dt.updatedAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(`<a href="/v1/admin/manage_property_request/view_details/${dt._id}" class="btn btn-outline-primary" title="View Details"><i class="fas fa-eye"></i></a>`);
            arr.push(arr1);
        }
        obj.data = arr;
        return res.send(obj)
    },
    viewDetails: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid record details. please try again.", status: false });
            return res.redirect("/v1/admin/manage_property_request");
        }
        let record = await PropertyRequest.aggregate([
            { $match: { _id: mongoose.mongo.ObjectId(id), isDeleted: 0 } },
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "propertyData"
                }
            },
            {
                $lookup: {
                    from: "property_requests",
                    localField: "sold_reqId",
                    foreignField: "_id",
                    as: "propertyReqData"
                }
            },
            {
                $lookup: {
                    from: "admins",
                    localField: "propertyData.agentId",
                    foreignField: "_id",
                    as: "adminData"
                }
            },
            {
                $lookup: {
                    from: "agents",
                    localField: "propertyData.agentId",
                    foreignField: "_id",
                    as: "agentData"
                }
            }
        ])
        if (!record[0]) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/admin/manage_property_request");
        }
        if (record[0].status == "Pending") {
            await PropertyRequest.updateOne({ _id: id }, { status: "In Processing" });
        }
        let title = "Property Request | View Details";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" },
            { title: "Property Request", url: "/v1/admin/manage_property_request" },
            { title: "View Details", url: "/v1/admin/manage_property_request/view_details/" + id }
        ];
        return res.render("v1/admin/property_request/view_details", { layout: "v1/admin/layout", title, BREADCRUMB, moment, data: record[0] });
    },
    changeStatus: async (req, res) => {
        let id = req.params.id;
        let { status, remarks } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({
                status: "error",
                message: "Invalid record details. please try again.",
                data: {}
            })
        }
        let record = await PropertyRequest.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        if (record.status == "Accepted" || record.status == "Rejected" || record.status == "Already Sold") {
            return res.json({
                status: "error",
                message: "Already updated record.",
                data: {}
            });
        }
        let propertyData = await Property.findOne({ _id: record.propertyId, status: true, isDeleted: 0, propertyStatus: "Approved" });
        if (!propertyData) {
            return res.json({
                status: "error",
                message: "Property already sold or inactive state.",
                data: {}
            });
        }
        let updatedRec = await PropertyRequest.findByIdAndUpdate(id, { status, remarks: remarks || "" });
        if (!updatedRec) {
            return res.json({
                status: "error",
                message: "Your record status is not change properly. please try again.",
                data: {}
            })
        }
        if (status == "Accepted") {
            await PropertyRequest.updateMany({ _id: { $ne: id }, propertyId: updatedRec.propertyId }, { status: "Already Sold", sold_reqId: updatedRec._id });
            await Property.findByIdAndUpdate(updatedRec.propertyId, { propertyStatus: "Sold" });
        }
        return res.json({
            status: "success",
            message: "Successfully changed status.",
            data: {}
        })
    }
}