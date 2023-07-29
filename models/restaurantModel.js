const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./userModel.js");
const Comment = require("./commentModel.js");
const Menu = require("./menuModel.js");

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


    menu: [{                                                                //buradaki menü id'si ile menu modelindeki id'yi ilişkilendiriyoruz
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu"
    }],
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
    // likes: [
    //     {
    //         type: mongoose.Schema.ObjectId,                                     //like alanı içindeki kullanıcı id'lerini tutuyoruz
    //         ref: "User"                                                         //ref ile hangi model ile ilişkilendirdiğimizi belirtiyoruz
    //     }
    // ],
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
        required: true,
        enum: [                                                                             //enum ile sadece belirtilen kategorilerden birini seçebiliriz
            "50-100",
            "100-150",
            "150-200",
            "200-250",
            "250-300",
            "300-up",                                                                       //300 ve üzeri bu şekilde yazılır çünkü enum içinde + işareti kullanılamıyor
            "500-up"
        ]
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
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    category: {
        type: String,
        required: true,
        enum: [                                                                             //enum ile sadece belirtilen kategorilerden birini seçebiliriz
            "Türk Mutfağı",
            "Kahvaltı",
            "FastFood",
            "Vegan",
            "Dünya Mutfağı",
            "Tatlılar",
            "Kahve",
            "İçecekler"
        ]
    },
    //max 3 yap
    tags: {
        type: Array,
        default: []
    },
    restaurant_image: {
        type: String,
        default: "default.jpg"
    },
    rate: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    rates: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

    }, { timestamps: true});




module.exports = mongoose.model("Restaurant", restaurantSchema);
