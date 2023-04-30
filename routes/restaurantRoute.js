const express = require("express");
const { getSingleRestaurant, getAllRestaurants,  } = require("../controllers/restaurantController.js");
const { checkRestaurantExist } = require("../middlewares/database/databaseErrorHelpers.js");

