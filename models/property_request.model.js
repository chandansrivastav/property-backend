const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const PropertyRequest = mongoose.model("property_request", new mongoose.Schema({
    propertyId: {
        type: ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    req_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "In Processing", "Accepted", "Rejected", "Already Sold"],
        default: "Pending"
    },
    remarks: {
        type: String
    },
    sold_reqId: {
        type: ObjectId
    },
    isDeleted: {
        type: Number,
        default: 0
    }
}, { timestamps: true }));

function addPropertyReq(data) {
    const schema = Joi.object({
        propertyId: Joi.objectId().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        mobile: Joi.string().length(10).pattern(/^[6-9]\d{9}$/).required(),
        req_date: Joi.string().required(),
        req_time: Joi.string().required()
    });
    return schema.validate(data);
}

module.exports = {
    PropertyRequest,
    addPropertyReq
}