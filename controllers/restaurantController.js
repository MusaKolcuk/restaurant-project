const user = require("../models/userModel");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const createRestaurant = async (req, res) => {
    try {
        const { name } = req.body;
        const existingRestaurant = await Restaurant.findOne({ name });

        if (!existingRestaurant) {
        const restaurant = await Restaurant.create({
            ...req.body,
            createdBy: req.user.id,
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



const updateRestaurant = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await Restaurant.findById(restaurantId)

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "The restaurant was not found"
            })
        }
        if (!restaurant.createdBy || restaurant.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this restaurant"
            })
        }
        const updatedRestaurant = await Restaurant.findOneAndUpdate({ _id: restaurantId }, { $set: req.body }, { new: true })
        return res.status(200).json({
            success: true,
            message: "Your restaurant has been updated",
            updatedRestaurant,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Restaurant couldn't updated" + error
        })
    }
}




module.exports = { createRestaurant, getAllRestaurants, deleteRestaurant, updateRestaurant };