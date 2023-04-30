const mongoose = require("mongoose");
const user = require("./userModel");
const Schema = mongoose.Schema;

const menuSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",                              //restaurant modelinden referans alacak
        required: true
    },
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
    category: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    }
}, { timestamps: true });


module.exports = mongoose.model("Menu", menuSchema);
