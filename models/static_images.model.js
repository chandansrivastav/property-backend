const mongoose = require("mongoose");

const StaticImage = mongoose.model("static_image", new mongoose.Schema({
    name: {
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

module.exports = {
    StaticImage
}