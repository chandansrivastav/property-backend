const mongoose = require("mongoose");

const Location = mongoose.model("location", new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    orderBy: {
        type: Number,
        default: 0
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
    Location
}