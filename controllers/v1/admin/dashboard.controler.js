const moment = require("moment");
const { Property } = require("../../../models/property.model");
const { PropertyRequest } = require("../../../models/property_request.model");
module.exports = {
    dashboard: async (req, res) => {
        let title = "Dashboard";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/admin/dashboard" }
        ];
        let totalProperty = await Property.countDocuments({ isDeleted: 0, status: true });
        let availableProperty = await Property.countDocuments({ isDeleted: 0, status: true, propertyStatus: "Approved" });
        let waitingForAppProperty = await Property.countDocuments({ isDeleted: 0, status: true, propertyStatus: "Pending" });
        let soldProperty = await Property.countDocuments({ isDeleted: 0, status: true, propertyStatus: "Sold" });
        let recentPropertyLst = await Property.aggregate([
            { $match: { isDeleted: 0 } },
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
            { $sort: { createdAt: -1 } },
            { $limit: 5 }
        ]);
        let recentPropertyReqLst = await PropertyRequest.aggregate([
            { $match: { isDeleted: 0 } },
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "propertyData"
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 5 }
        ]);
        let data = {
            totalProperty,
            availableProperty,
            waitingForAppProperty,
            soldProperty,
            recentPropertyLst,
            recentPropertyReqLst
        }
        return res.render("v1/admin/dashboard/dashboard", { layout: "v1/admin/layout", title, BREADCRUMB, moment, data });
    }
}