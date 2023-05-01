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
    likeCount: {                                                                //kaç kişi beğendi en çok beğenilen restaurant göstermek için
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,                                     //like alanı içindeki kullanıcı id'lerini tutuyoruz
            ref: "User"                                                         //ref ile hangi model ile ilişkilendirdiğimizi belirtiyoruz
        }
    ],
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
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    }, { timestamps: true});

module.exports = mongoose.model("Restaurant", restaurantSchema);
