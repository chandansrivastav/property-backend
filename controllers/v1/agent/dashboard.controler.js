const moment = require("moment");
const { Property } = require("../../../models/property.model");
module.exports = {
    dashboard: async (req, res) => {
        let id = req.session.agentId;
        let title = "Dashboard";
        let BREADCRUMB = [
            { title: "Dashboard", url: "/v1/agent/dashboard" }
        ];
        let totalProperty = await Property.countDocuments({ agentId: id, isDeleted: 0, status: true });
        let availableProperty = await Property.countDocuments({ agentId: id, isDeleted: 0, status: true, propertyStatus: "Approved" });
        let waitingForAppProperty = await Property.countDocuments({ agentId: id, isDeleted: 0, status: true, propertyStatus: "Pending" });
        let soldProperty = await Property.countDocuments({ agentId: id, isDeleted: 0, status: true, propertyStatus: "Sold" });
        let recentPropertyLst = await Property.find({ isDeleted: 0, agentId: id }).sort({ createdAt: -1 }).limit(5);
        let data = {
            totalProperty,
            availableProperty,
            waitingForAppProperty,
            soldProperty,
            recentPropertyLst
        }
        return res.render("v1/agent/dashboard/dashboard", { layout: "v1/agent/layout", title, BREADCRUMB, moment, data });
    }
}