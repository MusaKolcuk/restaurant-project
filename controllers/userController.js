const User = require("../models/userModel");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const Restaurant = require("../models/restaurantModel");


const getSingleUser = asyncErrorWrapper(async (req, res, next) => {

    const {id} = req.params;                                                                //id bilgisi url'den alinir.
    const user = await User.findById(id);                                                   //id bilgisi ile kullanici bilgileri alinir.

    return res.status(200)
    .json({
        success: true,
        data: user
});
});

const getAllUsers = asyncErrorWrapper(async (req, res, next) => {
    const users = await User.find();                                                        //tum kullanici bilgileri alinir.

    return res.status(200)
    .json({
        success: true,
        data: users
});
});

//bu fonksiyon restoranlari favorilere eklemek icin kullaniliyor. Eğer zaten favori ise favorilerden çıkarır.
const addToFavorites = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    const user = await User.findById(userId);
    const restaurant = await Restaurant.findById(id);

    if (!user) {
        return next(new CustomError("The user not found", 404));
    }

    if (!restaurant) {
        return next(new CustomError("The restaurant not found", 404));
    }

    const index = user.favorites.indexOf(id);

    if (index === -1) {
      // Restoran favori değilse, favorilere ekleyin
        user.favorites.push(id);
    } else {
      // Restoran favori ise, favorilerden çıkarın
        user.favorites.splice(index, 1);
    }

    await user.save();

    return res.status(200).json({
        success: true,
        message: `The restaurant has been ${
        index === -1 ? "added to" : "removed from"
    } your favorites.`,
    });
});

// restaurant bu favoriye eklenmis mi kontrol edilir
const isFavorited = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    const user = await User.findById(userId);

    if (!user) {
        return next(new CustomError("The user not found", 404));
    }

    const isFavorited = user.favorites.some(favorite => favorite.toString() === id);

    return res.status(200).json({
        success: true,
        isFavorited
    });
});


// bu fonksiyonu kullaniciya ait tüm favori restoranlari almak icin kullaniyoruz.
const getUserFavorites = asyncErrorWrapper(async (req, res, next) => {

    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId).populate("favorites");

    if (!user) {
        return next(new CustomError("User not found", 404));
    }
    res.status(200).json({
        success: true,
        data: user.favorites,
    });
});



module.exports = { getSingleUser, getAllUsers, addToFavorites, isFavorited , getUserFavorites, }