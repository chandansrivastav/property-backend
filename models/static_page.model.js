const mongoose = require("mongoose");
const Joi = require("joi");
const StaticPage = mongoose.model("static_page", new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
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

function staticPageValidate(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        content: Joi.string().required(),
        files: Joi.optional()
    });
    return schema.validate(data);
}

module.exports = {
    StaticPage,
    staticPageValidate
}