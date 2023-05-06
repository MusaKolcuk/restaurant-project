const express = require("express");
const { getAccessToRoute, getRestaurantOwnerAccess } = require("../middlewares/authorization/auth.js");
const { createRestaurant, getAllRestaurants, deleteRestaurant, updateRestaurant, getSingleRestaurant, listCommentsForRestaurant, getRestaurantsByCategory} = require("../controllers/restaurantController.js");
const router = express.Router();

router.post("/", getAccessToRoute, createRestaurant);
router.get("/", getAllRestaurants);
router.delete("/:id", getAccessToRoute, deleteRestaurant);
router.put("/:id", [getAccessToRoute, getRestaurantOwnerAccess], updateRestaurant);
router.get("/:id", getSingleRestaurant);

//yorum islemleri
router.get("/:id/comments", listCommentsForRestaurant);

//restaurant category islemleri
router.get("/category/:category", getRestaurantsByCategory);            //burada category kısmına kategori ismi yazılacak eğer arasında boşluksa %20 ile yazılacak örneğin Türk%20Mutfağı gibi.


module.exports = router;