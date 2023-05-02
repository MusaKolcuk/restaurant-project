const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/restaurantModel.js");
const Menu = require("../models/menuModel.js");
const { checkUserExist } = require("../middlewares/database/databaseErrorHelpers.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CustomError = require("../helpers/error/CustomError.js");
const asyncErrorWrapper = require('express-async-handler');



const createMenu = asyncErrorWrapper(async (req, res, next) => {
    const { restaurantId, name, description, price, category, photo } = req.body;
    const userId = req.user.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new CustomError("The restaurant not found", 404));
    }

    // Restoranın sahibi mi kontrolü yapıldı eğer restoranın sahibi değilse menü oluşturulamaz
    if (restaurant.user && restaurant.user.toString() !== userId) {
        return next(new CustomError("Only the owner of the restaurant can create a menu", 403));
    }

    const newMenu = await Menu.create({
        restaurantId,
        name,
        description,
        price,
        category,
        photo,
    });

    // Restoranın menüsüne yeni menüyü ekleyelim
    restaurant.menu.push(newMenu);
    await restaurant.save();

    res.status(201).json({ message: "Menu created successfully", menu: newMenu });
});




const getAllMenu = asyncErrorWrapper(async (req, res) => {
    const allMenu = await Menu.find();
    res.status(200).json({ message: "Menus retrieved successfully", menus: allMenu });
});

const getDetailMenu = asyncErrorWrapper(async (req, res) => {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
        res.status(404).json({ message: "Menu not found" });
        return;
    }
    res.status(200).json({ message: "Menu retrieved successfully", menu });
});


const deleteMenu = asyncErrorWrapper(async (req, res, next) => {
    const menuId = req.params.id;

    const menu = await Menu.findById(menuId);
    if (!menu) {
        return next(new CustomError("Menu not found", 404));
    }

    // Restoranın sahibi mi kontrolü yapalım
    const restaurant = await Restaurant.findById(menu.restaurantId);
    if (!restaurant) {
        return next(new CustomError("The restaurant not found", 404));
    }

    if (restaurant.user && restaurant.user.toString() !== req.user.id) {
        return next(new CustomError("Only the owner of the restaurant can delete this menu", 403));
    }

    // Menüyü silme işlemini gerçekleştirelim
    const deletedMenu = await Menu.findByIdAndDelete(menuId);
    if (!deletedMenu) {
        return next(new CustomError("Menu not found", 404));
    }

    //Menüyü sildikten sonra restaurant ında  menüsünden de silmemiz gerekiyor bunun için restaurant ı güncelleme işlemi yapalım
    await Restaurant.findByIdAndUpdate(deletedMenu.restaurantId, {
        $pull: { menu: menuId }
        });


    res.status(200).json({ message: "Menu deleted successfully" });
});




module.exports = { createMenu, getAllMenu, getDetailMenu, deleteMenu };