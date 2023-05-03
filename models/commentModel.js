const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./userModel.js");
const Restaurant = require("./restaurantModel.js");


const CommentSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Comment", CommentSchema);
