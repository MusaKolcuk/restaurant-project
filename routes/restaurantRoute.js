const express = require("express");
const { getAccessToRoute, getRestaurantOwnerAccess } = require("../middlewares/authorization/auth.js");
const { createRestaurant, getAllRestaurants, deleteRestaurant, updateRestaurant, getSingleRestaurant, } = require("../controllers/restaurantController.js");

const router = express.Router();

router.post("/", getAccessToRoute, createRestaurant);
router.get("/", getAllRestaurants);
router.delete("/:id", getAccessToRoute, deleteRestaurant);
router.put("/:id", [getAccessToRoute, getRestaurantOwnerAccess], updateRestaurant);
router.get("/:id", getSingleRestaurant);





//  router.get("/:id/like", [getAccessToRoute, ], likeQuestion);



module.exports = router;