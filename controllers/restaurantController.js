const user = require("../models/userModel");
const Restaurant = require("../models/restaurantModel");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const createRestaurant = async (req, res) => {
    try {
        const { name } = req.body;
        const existingRestaurant = await Restaurant.findOne({ name });

        if (!existingRestaurant) {
        const restaurant = await Restaurant.create({
            ...req.body,
            user: req.user.id,
        });

        res.status(201).json({ success: true, restaurant });
        } else {
        return res.status(400).json({
            success: false,
            message: "The restaurant is already created.",
        });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
        success: false,
        error,

        });
    }
};


const getAllRestaurants = async (req, res) => {
    try {
        const { page = 1, limit = 10, name, location, rating } = req.query;     //sayfalama, sıralama, filtreleme ve sınırlandırma özelliklerini ekle
        const skip = (page - 1) * limit;

        const query = {};                                                       //bos bir sorgu nesnesi olustur

        if (name) {
            query.name = { $regex: name, $options: 'i' };                       //regex kullanip $options: 'i' yaparak büyük-kücük harf duyarsizligini aktif ettik
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        let sort = { name: 1 };                                                // Varsayılan siralama kriteri isme göre artan siralama, ancak rating verildiginde rating'e göre azalan siralama yaptim

        if (rating) {
            sort = { rating: -1 };
        }

        const restaurants = await Restaurant.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({ success: true, restaurants });
    } catch (error) {
        return res.status(500).json({
        success: false,
        error,
        });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRestaurant = await Restaurant.findByIdAndDelete(id);

        if (!deletedRestaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }

        res.status(200).json({ success: true, message: "Restaurant deleted successfully." });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error,
        });
    }
};



const updateRestaurant = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, location, menu, photos, phone, website, openingHours, cuisine, priceRange, acceptsReservations, parkingOptions, creditCard, featuredDishes } = req.body;

    let restaurant = await Restaurant.findById(id).populate("user");

    // Restoran sahibi kontrolü burada gerçekleştirilmeli.
    if (!restaurant.user || restaurant.user._id.toString() !== req.user.id) {
        return next(new CustomError("Only the owner of the restaurant can update the restaurant", 403));
    }

    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    restaurant.location = location || restaurant.location;
    restaurant.menu = menu || restaurant.menu;
    restaurant.photos = photos || restaurant.photos;
    restaurant.phone = phone || restaurant.phone;
    restaurant.website = website || restaurant.website;
    restaurant.openingHours = openingHours || restaurant.openingHours;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.priceRange = priceRange || restaurant.priceRange;
    restaurant.acceptsReservations = acceptsReservations || restaurant.acceptsReservations;
    restaurant.parkingOptions = parkingOptions || restaurant.parkingOptions;
    restaurant.creditCard = creditCard || restaurant.creditCard;
    restaurant.featuredDishes = featuredDishes || restaurant.featuredDishes;

    restaurant = await restaurant.save();

    return res.status(200).json({
        success: true,
        data: restaurant
    });
});

const getSingleRestaurant = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id).populate("user");

    if (!restaurant) {
        return next(new CustomError("The restaurant not found", 404));
    }

    return res.status(200).json({
        success: true,
        data: restaurant
    });
});








module.exports = { createRestaurant, getAllRestaurants, deleteRestaurant, updateRestaurant, getSingleRestaurant};