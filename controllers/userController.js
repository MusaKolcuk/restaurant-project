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
    const { id: userId } = req.user;                                                        //istek yapan kullanici bilgileri alinir.

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

//bu fonksiyon kullanıcıyı takip etmek için kullanılıyor.
const followUser = asyncErrorWrapper(async (req, res, next) => {
    const { id: userId } = req.user;
    const { id: userIdToFollow } = req.params;

    // Takip edilecek kullanıcının mevcut olup olmadığını kontrol edin.
    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow) {
        return next(new CustomError('The user you want to follow does not exist', 404));
    }

    const user = await User.findById(userId);

    // Takip etmek istediği kullanıcı kendi hesabı mı?
    if (userId === userIdToFollow) {
        return next(new CustomError('You cannot follow yourself', 400));
    }

    // Takip etmek istediği kullanıcıyı takip ediyor mu?
    if (user.following.includes(userIdToFollow)) {
        return next(new CustomError('You already follow this user', 400));
    }

    // Takip edilen kullanıcının takipçi listesine takipçi olarak ekleyin.
    userToFollow.followers.push(userId);
    await userToFollow.save();

    // Takip eden kullanıcının takip ettiği kullanıcılara ekleyin.
    user.following.push(userIdToFollow);
    await user.save();

    return res.status(200).json({
        success: true,
        message: `You are now following ${userToFollow.username}`,
    });
});



//bu fonksiyon kullanıcıyı takipten çıkarmak için kullanılıyor.
const unfollowUser = asyncErrorWrapper(async (req, res, next) => {
    const { id: userId } = req.user;
    const { id: userIdToUnfollow } = req.params;

    // Takip edilen kullanıcının mevcut olup olmadığını kontrol edin.
    const userToUnfollow = await User.findById(userIdToUnfollow);
    if (!userToUnfollow) {
        return next(new CustomError('The user you want to unfollow does not exist', 404));
    }

    const user = await User.findById(userId);

    // Takip etmek istediği kullanıcıyı takip ediyor mu?
    if (!user.following.includes(userIdToUnfollow)) {
        return next(new CustomError('You do not follow this user', 400));
    }

    // Takip edilen kullanıcının takipçi listesinden çıkarın.
    userToUnfollow.followers.pull(userId);
    await userToUnfollow.save();

    // Takip eden kullanıcının takip ettiği kullanıcılardan çıkarın.
    user.following.pull(userIdToUnfollow);
    await user.save();

    return res.status(200).json({
        success: true,
        message: `You have unfollowed ${userToUnfollow.username}`,
    });
});

//bu fonksiyon ile kullanıcının tüm takipçilerini listeliyoruz.
const getFollowers = asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        return next(new CustomError('The user you are looking for does not exist', 404));
    }

    // Kullanıcının takipçilerini alın ve gönderin.
    const followers = await User.find({ _id: { $in: user.followers } }); // $in operatörü ile bir dizi içindeki değerleri arayabiliriz. yani user.followers dizisindeki id'leri arayabiliriz.
    return res.status(200).json({
        success: true,
        count: followers.length,
        data: followers,
    });
});


module.exports = { getSingleUser, getAllUsers, addToFavorites, isFavorited , getUserFavorites, followUser, unfollowUser, getFollowers  }