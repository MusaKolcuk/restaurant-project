const express = require("express");
const { getSingleUser, getAllUsers, addToFavorites, isFavorited, getUserFavorites, } = require("../controllers/userController.js");
const { checkUserExist } = require("../middlewares/database/databaseErrorHelpers.js");
const { getAccessToRoute } = require("../middlewares/authorization/auth.js");

const router = express.Router();


router.get("/", getAllUsers);
router.get("/:id", checkUserExist, getSingleUser);

router.put("/:id/addToFavorites", getAccessToRoute, addToFavorites);
router.get("/:id/isFavorited", getAccessToRoute, isFavorited);
router.get("/:id/favorites", getAccessToRoute, getUserFavorites);



module.exports = router;