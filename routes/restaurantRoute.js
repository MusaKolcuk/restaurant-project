const express = require("express");
const { getSingleRestaurant, getAllRestaurants,  } = require("../controllers/restaurantController.js");
const { checkRestaurantExist } = require("../middlewares/database/databaseErrorHelpers.js");
const { getAccessToRoute } = require("../middlewares/authorization/auth.js");
const { createRestaurant, deleteRestaurant, updateRestaurant } = require("../controllers/restaurantController.js");

const router = express.Router();

router.route("/").post(authMiddleware.protect, restaurantController.createRestaurant);
router.route("/").get(restaurantController.getAllRestaurants);
router.route("/:id").delete(authMiddleware.protect, restaurantController.deleteRestaurant);



router.route("/:id").put(authMiddleware.protect, restaurantController.updateRestaurant);

module.exports = router;