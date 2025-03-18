const mongoose = require("mongoose");
const mongoSchema = new mongoose.Schema({
    token: {
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
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 6 * 60 * 60
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const FrontToken = mongoose.model("FrontToken", mongoSchema);

module.exports = {
    FrontToken
}