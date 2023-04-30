const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,

    },
    description: {
        type: String,
        // required: true
    },
    location: {
        type: String,
        required: true
    },
    menu: {
        type: Array,
        required: true
    },

    photos: {
        type: Array,
        default: []
    },
    phone: {
        type: String,
        required: true
    },
    website: {
        type: String,
    },
    openingHours: {
        type: Array,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    priceRange: {                   //fiyat araligi
        type: String,
        required: true
    },
    acceptsReservations: {          //rezervasyon
        type: Boolean,
        default: false
    },
    parkingOptions: {
        type: Array,
        default: []
    },
    creditCard: {
        type: Boolean,
        required: true
    },
    featuredDishes: {               //one cikan yemekler
        type: Array,
        default: []
    }
    }, { timestamps: true});

module.exports = mongoose.model("Restaurant", restaurantSchema);
