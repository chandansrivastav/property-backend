const mongoose = require("mongoose");
const constant = require("../../../config/constant");
const { Property } = require("../../../models/property.model");
const { Category } = require("../../../models/category.model");
const { Location } = require("../../../models/location.model");
const { PropertyRequest, addPropertyReq } = require("../../../models/property_request.model");

module.exports = {
    propertyList: async (req, res) => {
        let { id, pageno, limit } = req.body;
        pageno = (+pageno > 0) ? +pageno : constant.DATA.PAGE;
        limit = (+limit > 0) ? +limit : constant.DATA.LIMIT;
        let skip = (pageno - 1) * limit;
        let sort = { createdAt: -1 };
        let search = {
            isDeleted: 0,
            status: true,
            propertyStatus: "Approved",
            $and: [
                { "categoryData.status": true },
                { "categoryData.isDeleted": 0 },
                { "locationData.status": true },
                { "locationData.isDeleted": 0 }
            ],
            $or: [
                {
                    $and: [
                        { "agentData.status": true },
                        { "agentData.isDeleted": 0 }
                    ]
                },
                {
                    $and: [
                        { "adminData.status": true },
                        { "adminData.isDeleted": 0 }
                    ]
                }
            ]
        };
        let pageData = await Category.findOne({ slug: id, isDeleted: 0, status: true });
        if (!pageData) pageData = await Location.findOne({ _id: id, isDeleted: 0, status: true });
        if (mongoose.Types.ObjectId.isValid(id)) {
            search.$and.push({ locationId: mongoose.mongo.ObjectId(id) });
        } else {
            search.$and.push({ "categoryData.slug": id });
        }
        let totalRecords = await Property.aggregate([
            {
                $lookup: {
                    from: "admins",
                    localField: "agentId",
                    foreignField: "_id",
                    as: "adminData"
                }
            },
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
            },
            { $match: search },
            {
                $project: {
                    adminData: 0,
                    agentData: 0
                }
            }
        ]);
        let result = await Property.aggregate([
            {
                $lookup: {
                    from: "admins",
                    localField: "agentId",
                    foreignField: "_id",
                    as: "adminData"
                }
            },
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
            },
            { $match: search },
            { $sort: sort },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    adminData: 0,
                    agentData: 0
                }
            }
        ]);
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch data.",
            data: {
                list: result || [],
                pageData: pageData || {},
                totalRecords: totalRecords?.length || 0,
                BASEIMAGEPATH: constant.DATA.SHOWPROPERTYPATH
            }
        })
    },
    propertyDetails: async (req, res) => {
        let { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(200).json({
                status: "error",
                message: "Property does not exist.",
                data: {}
            });
        }
        let record = await Property.aggregate([
            {
                $lookup: {
                    from: "admins",
                    localField: "agentId",
                    foreignField: "_id",
                    as: "adminData"
                }
            },
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
            },
            {
                $match: {
                    _id: mongoose.mongo.ObjectId(id),
                    isDeleted: 0,
                    status: true,
                    propertyStatus: { $in: ["Approved", "Sold"] },
                    $and: [
                        { "categoryData.status": true },
                        { "categoryData.isDeleted": 0 },
                        { "locationData.status": true },
                        { "locationData.isDeleted": 0 }
                    ],
                    $or: [
                        {
                            $and: [
                                { "agentData.status": true },
                                { "agentData.isDeleted": 0 }
                            ]
                        },
                        {
                            $and: [
                                { "adminData.status": true },
                                { "adminData.isDeleted": 0 }
                            ]
                        }
                    ]
                }
            },
            {
                $project: {
                    adminData: 0,
                    agentData: 0
                }
            }
        ]);
        if (!record[0]) {
            return res.status(200).json({
                status: "error",
                message: "Property does not exist.",
                data: {}
            });
        }
        return res.status(200).json({
            status: "success",
            message: "Successfully fetch data.",
            data: {
                details: record[0],
                BASEIMAGEPATH: constant.DATA.SHOWPROPERTYPATH
            }
        });
    },
    propertyReqAdd: async (req, res) => {
        const { error } = addPropertyReq(req.body);
        if (error) {
            return res.status(200).json({
                status: "error",
                message: error.details[0].message,
                data: {}
            });
        }
        let { propertyId, name, email, mobile, req_date, req_time } = req.body;
        let propertyData = await Property.findOne({ _id: propertyId, propertyStatus: "Approved", status: true, isDeleted: 0 });
        if (!propertyData) {
            return res.status(200).json({
                status: "error",
                message: "Sorry this property no longer exist.",
                data: {}
            });
        }
        email = email.toLowerCase().trim();
        let req_dateTime = new Date(req_date + " " + req_time);
        if (req_dateTime < Date.now()) {
            return res.status(200).json({
                status: "error",
                message: "You could not proceed with past date.",
                data: {}
            });
        }
        let propertyReq = await PropertyRequest.findOne({ $or: [{ email, mobile }], propertyId, status: { $in: ["Pending", "In Processing"] } });
        if (propertyReq) {
            return res.status(200).json({
                status: "error",
                message: "You have already requested for this property.",
                data: {}
            });
        }
        await new PropertyRequest({
            propertyId,
            name,
            email,
            mobile,
            req_date: req_dateTime
        }).save();
        return res.status(200).json({
            status: "success",
            message: "Congratulations your request is created for this property.",
            data: {}
        })
    }
}