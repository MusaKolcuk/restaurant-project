const mongoose = require("mongoose");
const User = require("./userModel.js");
const Restaurant = require("./restaurantModel.js");
const Schema = mongoose.Schema;

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    photo: {
        type: String,
        required: true
    }
});

const menuCategorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    items: [menuItemSchema]
});

const menuSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    menuCategories: [menuCategorySchema]
}, { timestamps: true });


module.exports = mongoose.model("Menu", menuSchema);

