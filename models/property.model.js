const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const Property = mongoose.model("property", new mongoose.Schema({
    agentId: {
        type: ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    locationId: {
        type: ObjectId,
        required: true
    },
    categoryId: {
        type: ObjectId,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: Array,
        default: []
    },
    propertyStatus: {
        type: String,
        enum: ["Pending", "Approved", "Sold", "Rejected"],
        default: "Pending"
    },
    rejectedReason: {
        type: String
    },
    details: {
        type: String,
        required: true
    },
    specifications: {
        type: String,
        required: true
    },
    amenities: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Number,
        default: 0
    }
}, { timestamps: true }));

function propertyValidator(data) {
    const schema = Joi.object({
        propertyTitle: Joi.string().required(),
        locationId: Joi.objectId().required().label("Location"),
        categoryId: Joi.objectId().required().label("Category"),
        price: Joi.string().required(),
        details: Joi.string().required().label("Property Details"),
        specifications: Joi.string().required().label("Property specifications"),
        amenities: Joi.string().required().label("Property amenities"),
        files: Joi.optional()
    });
    return schema.validate(data);
}

module.exports = {
    Property,
    propertyValidator
}