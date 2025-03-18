const mongoose = require("mongoose");

const Category = mongoose.model("category", new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
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
    Category
}