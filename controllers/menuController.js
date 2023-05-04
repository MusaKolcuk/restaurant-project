const asyncHandler = require("express-async-handler");
const Restaurant = require("../models/restaurantModel.js");
const Menu = require("../models/menuModel.js");
const { checkUserExist } = require("../middlewares/database/databaseErrorHelpers.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CustomError = require("../helpers/error/CustomError.js");
const asyncErrorWrapper = require('express-async-handler');


//bu fonksiyon ile yeni bir menu olusturulur.
const createMenu = asyncErrorWrapper(async (req, res, next) => {
    const { restaurantId, menuItems } = req.body;
    const userId = req.user.id;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return next(new CustomError("The restaurant not found", 404));
    }

    // Restoran sahibinin kontrolünü yap ve sahip değilse hata döndür
    if (restaurant.user && restaurant.user.toString() !== userId) {
        return next(new CustomError("Only the owner of the restaurant can create a menu", 403));
    }

    // Restoranın zaten bir menüsü olup olmadığını kontrol et her restoranın yalnızca bir menüsü olabilir
    const existingMenu = await Menu.findOne({ restaurantId });
    if (existingMenu) {
        return next(new CustomError("The restaurant already has a menu", 400));
    }

    // Menü öğelerini kategorilere göre gruplandırma
    const groupedMenuItems = {};

    menuItems.forEach(item => {
        if (!groupedMenuItems[item.category]) {
            groupedMenuItems[item.category] = [];
        }
        groupedMenuItems[item.category].push(item);
    });

    // Gruplandırılmış menü öğelerini düzenli bir diziye dönüştürme
    const formattedMenuItems = Object.entries(groupedMenuItems).map(([category, items]) => {
        return {
            category,
            items
        };
    });

    // Yeni menüyü oluştur ve veritabanına kaydet
    const newMenu = await Menu.create({
        restaurantId,
        menuCategories: formattedMenuItems
    });

    // Yeni menüyü restorana ekle ve restoranı kaydet
    restaurant.menu.push(newMenu);
    await restaurant.save();

    res.status(201).json({ message: "Menu created successfully", menu: newMenu, formattedMenuItems });
});


//bu fonksiyon ile restoranin menuleri listeleniyor.
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



//bu fonksiyon ile restoranin menuleri guncelleniyor.
const updateMenu = asyncErrorWrapper(async (req, res, next) => {
    const restaurantId = req.params.id;
    const { menuItems } = req.body;
    const userId = req.user.id;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        return next(new CustomError("The restaurant not found", 404));
    }

    // Restoran sahibinin kontrolünü yap ve sahip değilse hata döndür
    if (restaurant.user && restaurant.user.toString() !== userId) {
        return next(new CustomError("Only the owner of the restaurant can update this menu", 403));
    }

    const menu = await Menu.findOne({ restaurantId });
    if (!menu) {
        return next(new CustomError("Menu not found", 404));
    }

    // Menü öğelerini kategorilere göre gruplandırma
    const groupedMenuItems = {};

    menuItems.forEach(item => {
        if (!groupedMenuItems[item.category]) {
            groupedMenuItems[item.category] = [];
        }
        groupedMenuItems[item.category].push(item);
    });

    // Gruplandırılmış menü öğelerini düzenli bir diziye dönüştürme
    const formattedMenuItems = Object.entries(groupedMenuItems).map(([category, items]) => {
        return {
            category,
            items
        };
    });

    // Menüyü güncelle ve veritabanında kaydet
    menu.menuCategories = formattedMenuItems;
    await menu.save();

    res.status(200).json({ message: "Menu updated successfully", menu });
});


//bu fonksiyon ile menu de bulunan itemlar aranir.
const searchMenuItemByName = asyncErrorWrapper(async (req, res, next) => {
    const { name } = req.query;

    if (!name) {
        return next(new CustomError("Please provide a name to search", 400));
    }

    const menuItems = await Menu.aggregate([
        // unwind işlemi ile menuCategories ve items alanlarındaki arrayler tek tek döndürülür.
        { $unwind: "$menuCategories" },
        { $unwind: "$menuCategories.items" },
        {
            // match işlemi ile arama yapılır.
            $match: {
                "menuCategories.items.name": {
                    $regex: name,
                    $options: "i"
                }
            }
        },
        {
            //lookup işlemi ile restaurant bilgileri getirilir.
            $lookup: {
                from: "restaurants",
                localField: "restaurantId",
                foreignField: "_id",
                as: "restaurant"
            }
        },
        {
            //unwind işlemi ile restaurant alanı tek tek döndürülür.
            $unwind: "$restaurant"
        },
            //project işlemi ile sadece istenilen alanlar getirilir.
        {
            $project: {
                _id: "$menuCategories.items._id",
                name: "$menuCategories.items.name",
                // description: "$menuCategories.items.description",                                                //suanlik description ihtiyacimiz yok
                price: "$menuCategories.items.price",
                photo: "$menuCategories.items.photo",
                restaurant: {
                    _id: "$restaurant._id",
                    name: "$restaurant.name"
                }
            }
        }
    ]);

    res.status(200).json({ success: true, menuItems });
});



module.exports = { createMenu, getAllMenu, getDetailMenu, deleteMenu, updateMenu, searchMenuItemByName, };