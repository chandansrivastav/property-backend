const moment = require("moment");
const mongoose = require("mongoose");
const { v4 } = require("uuid");
const constant = require("../../../config/constant");
const { Property, propertyValidator } = require("../../../models/property.model");
const { Location } = require("../../../models/location.model");
const { Category } = require("../../../models/category.model");

module.exports = {
    index: async (req, res) => {
        let title = "Property";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/agent/dashboard" },
            { title: "Property", url: "/v1/agent/manage_property" }
        ];
        return res.render("v1/agent/property/view", { layout: "v1/agent/layout", title, BREADCRUMB });
    },
    list: async (req, res) => {
        // let search = { isDeleted: 0, propertyStatus: { $in: ["Approved", "Sold"] } };
        let search = { isDeleted: 0, agentId: mongoose.mongo.ObjectId(req.session.agentId) };
        let searchVal = req.body.search.value;
        if (searchVal) {
            search.$or = [
                { title: { $regex: searchVal, $options: "i" } },
                { propertyStatus: { $regex: searchVal, $options: "i" } },
            ];
        }
        let skip = +req.body.start || 0;
        let limit = +req.body.length || +constant.DATA.LIMIT;
        let sort = { createdAt: -1 };
        let totalRecords = await Property.aggregate([
            { $match: search }
        ]);
        let data = await Property.aggregate([
            { $match: search },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit }
        ]);
        let totalCount = Array.isArray(totalRecords) ? totalRecords.length : 0;
        let obj = {};
        obj.draw = req.body.draw;
        obj.recordsTotal = totalCount;
        obj.recordsFiltered = totalCount;
        let arr = [];
        for (let dt of data) {
            let arr1 = [];
            arr1.push(`<img src="${(dt.image && dt.image[0]) ? constant.DATA.SHOWPROPERTYPATH + dt.image[0] : constant.DATA.NOPROFILE}" height="50">`);
            arr1.push(dt.title);
            arr1.push(dt.propertyStatus);
            arr1.push(moment(dt.createdAt).format(constant.DATA.DEFAULTDATEFORMAT));
            arr1.push(moment(dt.updatedAt).format(constant.DATA.DEFAULTDATEFORMAT));
            let status = '';
            if (dt.status) {
                status = `<a href="javascript:void(0)" class="badge badge-success" onclick="changeStatus('${dt._id}')">Active</a>`;
            } else {
                status = `<a href="javascript:void(0)" class="badge badge-danger" onclick="changeStatus('${dt._id}')">Inactive</a>`;
            }
            arr1.push(status);
            if (dt.propertyStatus == "Pending" || dt.propertyStatus == "Rejected") {
                arr1.push(`<a href="/v1/agent/manage_property/edit/${dt._id}" class="btn btn-outline-primary" title="Edit"><i class="fas fa-edit"></i></a> <a href="/v1/agent/manage_property/view_details/${dt._id}" class="btn btn-outline-primary" title="View Details"><i class="fas fa-eye"></i></a> <a class="btn btn-outline-danger" onclick="deleteRecord('${dt._id}')" title="Delete"><i class="fas fa-trash"></i></a>`);
            } else {
                arr1.push(`<a href="/v1/agent/manage_property/view_details/${dt._id}" class="btn btn-outline-primary" title="View Details"><i class="fas fa-eye"></i></a>`);
            }
            arr.push(arr1)
        }
        obj.data = arr;
        return res.send(obj)
    },
    add: async (req, res) => {
        if (req.method == "POST") {
            const { error } = propertyValidator(req.body);
            if (error) {
                req.flash("message", { message: error.details[0].message, status: false });
                return res.redirect("/v1/agent/manage_property/add");
            }
            let { propertyTitle, categoryId, locationId, price, details, specifications, amenities } = req.body;
            if (await Property.findOne({ title: propertyTitle, isDeleted: 0 })) {
                req.flash("message", { message: "This property are already exist.", status: false });
                return res.redirect("/v1/agent/manage_property/add");
            }
            let image = [];
            if (req.files && req.files.image) {
                if (Array.isArray(req.files.image)) {
                    for (let imgData of req.files.image) {
                        let imageName = v4() + "_" + imgData.name;
                        await imgData.mv(constant.DATA.UPLOADPROPERTYPATH + imageName);
                        image.push(imageName);
                    }
                } else {
                    let imageName = v4() + "_" + req.files.image.name;
                    await req.files.image.mv(constant.DATA.UPLOADPROPERTYPATH + imageName);
                    image.push(imageName);
                }
            }
            await new Property({
                agentId: req.session.agentId,
                title: propertyTitle,
                locationId,
                categoryId,
                price: +price || 0,
                image,
                propertyStatus: "Pending",
                details,
                specifications,
                amenities
            }).save();
            req.flash("message", { message: "Successfully Save Record.", status: true });
            return res.redirect("/v1/agent/manage_property");
        } else {
            let title = "Property | Add";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/agent/dashboard" },
                { title: "Property", url: "/v1/agent/manage_property" },
                { title: "Add", url: "/v1/agent/manage_property/add" }
            ];
            let locationList = await Location.find({ isDeleted: 0, status: true });
            let categoryList = await Category.find({ isDeleted: 0, status: true });
            let listData = {
                locationList: locationList || [],
                categoryList: categoryList || []
            }
            return res.render("v1/agent/property/add", { layout: "v1/agent/layout", title, BREADCRUMB, listData, data: {} });
        }
    },
    edit: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid url. please try again.", status: false });
            return res.redirect("/v1/agent/manage_property");
        }
        let record = await Property.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/agent/manage_property");
        }
        if (record.propertyStatus == "Approved" || record.propertyStatus == "Sold") {
            req.flash("message", { message: "You are not eligible for editing details. please contact to admin.", status: false });
            return res.redirect("/v1/agent/manage_property");
        }
        if (req.method == "POST") {
            const { error } = propertyValidator(req.body);
            if (error) {
                req.flash("message", { message: error.details[0].message, status: false });
                return res.redirect("/v1/agent/manage_property/edit/" + id);
            }
            let { propertyTitle, locationId, categoryId, price, details, specifications, amenities } = req.body;
            if (await Property.findOne({ title: propertyTitle, isDeleted: 0, _id: { $ne: id } })) {
                req.flash("message", { message: "This property are already exist.", status: false });
                return res.redirect("/v1/agent/manage_property/edit/" + id);
            }
            let obj = {
                title: propertyTitle,
                locationId,
                categoryId,
                price: +price || 0,
                details,
                specifications,
                amenities
            };
            let image = [];
            if (req.files && req.files.image) {
                if (Array.isArray(req.files.image)) {
                    for (let imgData of req.files.image) {
                        let imageName = v4() + "_" + imgData.name;
                        await imgData.mv(constant.DATA.UPLOADPROPERTYPATH + imageName);
                        image.push(imageName);
                    }
                } else {
                    let imageName = v4() + "_" + req.files.image.name;
                    await req.files.image.mv(constant.DATA.UPLOADPROPERTYPATH + imageName);
                    image.push(imageName);
                }
                if (image.length) {
                    obj.image = image;
                }
            }
            let updateRec = await Property.findByIdAndUpdate(id, obj);
            if (!updateRec) {
                req.flash("message", { message: "Your record is not update properly. please try again.", status: false });
                return res.redirect("/v1/agent/manage_property/edit/" + id);
            } else {
                req.flash("message", { message: "Successfully Update Record.", status: true });
                return res.redirect("/v1/agent/manage_property");
            }
        } else {
            let title = "Property | Edit";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/agent/dashboard" },
                { title: "Property", url: "/v1/agent/manage_property" },
                { title: "Edit", url: "/v1/agent/manage_property/edit/" + id }
            ];
            let locationList = await Location.find({ isDeleted: 0, status: true });
            let categoryList = await Category.find({ isDeleted: 0, status: true });
            let listData = {
                locationList: locationList || [],
                categoryList: categoryList || []
            }
            return res.render("v1/agent/property/add", { layout: "v1/agent/layout", title, BREADCRUMB, listData, data: record });
        }
    },
    viewDetails: async (req, res) => {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("message", { message: "Invalid record details. please try again.", status: false });
            return res.redirect("/v1/agent/manage_property");
        }
        let record = await Property.aggregate([
            { $match: { _id: mongoose.mongo.ObjectId(id), isDeleted: 0 } },
            {
                $lookup: {
                    from: "agents",
                    localField: "agentId",
                    foreignField: "_id",
                    as: "agentData"
                }
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "locationId",
                    foreignField: "_id",
                    as: "locationData"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "categoryData"
                }
            }
        ]);
        if (Array.isArray(record) && record.length) {
            let title = "Property | View Details";
            let BREADCRUMB = [
                { title: "Dashboard", url: "/v1/agent/dashboard" },
                { title: "Property", url: "/v1/agent/manage_property" },
                { title: "View Details", url: "/v1/agent/manage_property/view_details/" + id }
            ];
            return res.render("v1/agent/property/view_details", { layout: "v1/agent/layout", title, BREADCRUMB, moment, data: record[0] });
        } else {
            req.flash("message", { message: "This record does not exist. please try again.", status: false });
            return res.redirect("/v1/agent/manage_property");
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
        let record = await Property.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        if (record.propertyStatus == "Sold") {
            return res.json({
                status: "error",
                message: "You are not eligible to change status of this record. please contact to admin.",
                data: {}
            })
        }
        let updatedRec = await Property.findByIdAndUpdate(id, { status: record.status ? false : true });
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
        let record = await Property.findOne({ _id: id, isDeleted: 0 });
        if (!record) {
            return res.json({
                status: "error",
                message: "This record does not exist. please try again.",
                data: {}
            })
        }
        if (record.propertyStatus == "Approved" || record.propertyStatus == "Sold") {
            return res.json({
                status: "error",
                message: "You are not eligible to delete this record. please contact to admin.",
                data: {}
            })
        }
        let updatedRec = await Property.findByIdAndUpdate(id, { isDeleted: 1 });
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