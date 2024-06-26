const Restaurant = require("../models/restaurantModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const QRCode = require("qrcode");
const fs = require("fs");
const mongoose = require("mongoose");

const createRestaurant = asyncErrorWrapper(async (req, res) => {
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
});



const getAllRestaurants = asyncErrorWrapper(async (req, res) => {
    const { page = 1, limit = 1000, name, location, rate, } = req.query;         //sayfalama, sıralama, filtreleme ve sınırlandırma özelliklerini ekle
    const skip = (page - 1) * limit;

    const query = {};                                                           //filtreleme için boş bir nesne oluştur

    if (name) {
        query.name = { $regex: name, $options: 'i' };
    }

    if (location) {
        query.location = { $regex: location, $options: 'i' };                   //i: büyük küçük harf duyarlılığı olmadan arama yapar
    }

    let sort = { name: 1 };

    if (rate) {
        sort = { rate: -1 };
    }

    const restaurants = await Restaurant.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));                                                //limit string olarak geliyor, integer'a çevirmek için parseInt kullan

        return res.status(200).json({ success: true, restaurants, count: restaurants.length });

});


const deleteRestaurant = asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;
    const deletedRestaurant = await Restaurant.findByIdAndDelete(id);

    if (!deletedRestaurant) {
        return res.status(404).json({
            success: false,
            message: "Restaurant not found.",
        });
    }

    res.status(200).json({ success: true, message: "Restaurant deleted successfully." });
});


//Restoranı güncellemek için kullanılır
const updateRestaurant = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, location, menu, photos, phone, website, openingHours, cuisine, priceRange, acceptsReservations, parkingOptions, creditCard, featuredDishes, category, tags, rate } = req.body;

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
    restaurant.category = category || restaurant.category;
    restaurant.tags = tags || restaurant.tags;
    restaurant.rate = rate || restaurant.rate;


    restaurant = await restaurant.save();

    return res.status(200).json({
        success: true,
        data: restaurant
    });

});



//bu fonksiyon tek bir restoranı listeler
const getSingleRestaurant = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
        .populate({
            path: 'user',
            select: '-followers -following -role -email'
        })
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'name profile_image',
            },
        })
        .populate("menu");

    if (!restaurant) {
        return next(new CustomError("The restaurant not found", 404));
    }

    const user = await User.findById(restaurant.user._id);
    restaurant.user._doc.followingCount = user.following.length;

    return res.status(200).json({
        success: true,
        data: restaurant
    });
});




//bu fonksiyonu kullanarak restoranın yorumlarını listele
const listCommentsForRestaurant = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;                                                                  // Restoranın ID'si

    // Restoranı veritabanından bulun
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
        return next(new CustomError("The restaurant not found", 404));
    }

    // Restoranın yorumlarını bulun ve kullanıcı bilgileriyle birlikte getirin
    const comments = await Comment.find({ restaurant: id })                                     //burada restaurant id'si ile eşleşen yorumları buluyoruz
        .populate({
            path: 'user',
            select: 'name profile_image'
        });

    // Yorumları döndürün
    return res.status(200).json({
        success: true,
        count: comments.length,                                                                 // Yorum sayısı
        data: comments
    });
});


//bu fonksiyon kategoriye göre restoranları listeler
const getRestaurantsByCategory = asyncErrorWrapper(async (req, res, next) => {
    const category = req.params.category;
    const restaurants = await Restaurant.find({ category });

    //eğer kategoriye göre restoran bulunamazsa hata döndürür
    if (!restaurants || restaurants.length === 0) {
        return next(new CustomError("No restaurants found for the given category", 404));
    }

    return res.status(200).json({
        success: true,
        count: restaurants.length,                                                                //kategoriye göre restoran sayısı
        data: restaurants
    });
});


//bu fonksiyon fiyat aralığına göre restoranları listeler
const getRestaurantsByPriceRange = asyncErrorWrapper(async (req, res, next) => {
    const { priceRange } = req.params;

    if (!priceRange) {
        return next(new CustomError("Price range is required for filtering", 400));
    }

    const restaurants = await Restaurant.find({ priceRange });

    if (!restaurants || restaurants.length === 0) {
        return next(new CustomError("No restaurants found for the given price range", 404));
    }

    return res.status(200).json({
        success: true,
        count: restaurants.length,                                                                  // Fiyat aralığına göre restoran sayısı
        data: restaurants
    });
});



//bu fonksiyon restaurant menüsü için QR kod oluşturur
const generateQRCode = asyncErrorWrapper(async (req, res, next) => {
    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return next(new CustomError("Restaurant not found", 404));
    }

    // QR kodda saklanacak veriyi belirleyin (ör. restoranın menüsüne erişim için bir URL)
    const data = `https://example.com/restaurant/${restaurantId}/menu`;

    const qrCode = await new Promise((resolve, reject) => {
        QRCode.toDataURL(data, (err, url) => {
            if (err) {
                reject(new CustomError("Failed to generate QR code", 500));
            } else {
                resolve(url);
            }
        });
    });

    res.status(200).json({ success: true, qrCode });
});


//bu fonksiyon restoran resimlerini yükler.
const imageUpload = asyncErrorWrapper(async (req, res, next) => {

    const restaurantId = req.params.id;                                             //restoran id'sini aliriz.

    const restaurant = await Restaurant.findById(restaurantId);

    if(!req.savedProfileImage) {
        return next(new CustomError("Please select an image", 400));
    }
    if(!restaurant.restaurant_image.includes("default.jpg")) {
        if(fs.existsSync(`./public/uploads/${restaurant.restaurant_image}`)) {
            fs.unlinkSync(`./public/uploads/${restaurant.restaurant_image}`);
        }
    }

    restaurant.restaurant_image = req.savedProfileImage;

    await restaurant.save();

    return res.status(200).json({
        success: true,
        message: "Image Upload Successful",
        data: restaurant,
    })
});

const deleteRestaurantImage = asyncErrorWrapper(async (req, res, next) => {
    const {id} = req.params;

    const restaurant = await Restaurant.findById(id);

    if(restaurant.restaurant_image.includes("default.jpg")) {
        return next(new CustomError("This image can not be deleted", 400));
    }

    if(fs.existsSync(`./public/uploads/${restaurant.restaurant_image}`)) {
        fs.unlinkSync(`./public/uploads/${restaurant.restaurant_image}`);
    }

    restaurant.restaurant_image = "default.jpg";

    await restaurant.save();

    return res.status(200).json({
        success: true,
        message: "Delete Profile Image Successfull",
        data: restaurant
    });
});

const getAllCategories = asyncErrorWrapper(async (req, res, next) => {
    const categories = mongoose.model('Restaurant').schema.path('category').enumValues;

    return res.status(200).json({
        success: true,
        data: categories
    });
});




module.exports = { createRestaurant, getAllRestaurants, deleteRestaurant, updateRestaurant, getSingleRestaurant, listCommentsForRestaurant, getRestaurantsByCategory,
    getRestaurantsByPriceRange, generateQRCode, imageUpload, deleteRestaurantImage, getAllCategories };