const mongoose = require("mongoose");
const Joi = require("joi");
const ContactUs = mongoose.model("contact_us", new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    remarks: {
        type: String
    },
    status: {
        type: String,
        enum: ["Pending", "In Processing", "Close"],
        default: "Pending"
    },
    isDeleted: {
        type: Number,
        default: 0
    }
}, { timestamps: true }));

function contactUsValidate(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        message: Joi.string().required()
    });
    return schema.validate(data);
}

function markAsCloseContactUs(data) {
    const schema = Joi.object({
        remarks: Joi.string().required()
    });
    return schema.validate(data);
}

module.exports = {
    ContactUs,
    contactUsValidate,
    markAsCloseContactUs
}