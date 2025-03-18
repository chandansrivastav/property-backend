const mongoose = require("mongoose");
const Joi = require("joi");
const mongoSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    profileStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    rejectReason: {
        type: String
    },
    token: {
        type: String
    },
    tokenTime: {
        type: Date
    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Agent = mongoose.model("Agent", mongoSchema);

function addAgentValidation(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        mobile: Joi.string().length(10),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
}
function editAgentValidation(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        mobile: Joi.string().length(10),
        password: Joi.optional()
    });
    return schema.validate(data);
}

module.exports = {
    Agent,
    addAgentValidation,
    editAgentValidation
}