const mongoose = require("mongoose");
const Joi = require("joi");
const Testimonials = mongoose.model("testimonial", new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    address: {
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

function testimonialsValidate(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required(),
        content: Joi.string().required(),
        files: Joi.optional()
    });
    return schema.validate(data);
}

module.exports = {
    Testimonials,
    testimonialsValidate
}