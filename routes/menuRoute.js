const express = require("express");
const menuController = require("../controllers/menuController.js");
const asyncHandler = require("express-async-handler");
const {createMenu , getAllMenu, getDetailMenu, deleteMenu} = require("../controllers/menuController.js");
const { getAccessToRoute, getRestaurantOwnerAccess } = require("../middlewares/authorization/auth.js");



const router = express.Router();

router.post("/", getAccessToRoute, createMenu);
router.get("/", getAllMenu);
router.get("/:id", getDetailMenu);

router.delete("/:id", getAccessToRoute, deleteMenu);

// buna bakılacak

// router.route("/:id").delete(authMiddleware.protect, menuController.deleteMenu);

// router.route("/:id").put(authMiddleware.protect, restaurantController.updateRestaurant);


module.exports = router;