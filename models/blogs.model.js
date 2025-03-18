const mongoose = require("mongoose");
const Joi = require("joi");
const Blog = mongoose.model("blog", new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
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

function blogValidate(data) {
    const schema = Joi.object({
        blogTitle: Joi.string().required(),
        content: Joi.string().required(),
        files: Joi.optional()
    });
    return schema.validate(data);
}

module.exports = {
    Blog,
    blogValidate
}