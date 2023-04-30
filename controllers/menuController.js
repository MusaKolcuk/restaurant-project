const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/restaurantModel.js");
const Menu = require("../models/menuModel.js");
const { checkUserExist } = require("../middlewares/database/databaseErrorHelpers.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CustomError = require("../helpers/error/CustomError.js");


const createMenu = async (req, res) => {
    try {
    const { restaurantId, name, description, price, category, photo } = req.body;

    const newMenu = await Menu.create({
        restaurantId,
        name,
        description,
        price,
        category,
        photo,
    });

    res.status(201).json({ message: "Menu created successfully", menu: newMenu });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
    }
};



const getAllMenu = async (req, res) => {
    try {
        const allMenu = await Menu.find();
        res.status(200).json({ message: "Menus retrieved successfully", menus: allMenu });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


const getDetailMenu = async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) {
            res.status(404).json({ message: "Menu not found" });
            return;
        }
        res.status(200).json({ message: "Menu retrieved successfully", menu });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



//Buraya bakıcam Apı testi hatalı

const deleteMenu = async (req, res) => {
    try {
        const menuId = req.params.id;
        const deletedMenu = await Menu.findByIdAndDelete(menuId);

        if (deletedMenu) {
        res.status(200).json({ message: "Menu deleted successfully" });
        } else {
        res.status(404).json({ message: "Menu not found" });
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = { createMenu, getAllMenu, getDetailMenu, deleteMenu };