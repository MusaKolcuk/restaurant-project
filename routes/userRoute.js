const express = require("express");
const { getSingleUser, getAllUsers, addToFavorites, isFavorited, getUserFavorites, followUser, unfollowUser, getFollowers, commentOnRestaurant, deleteComment} = require("../controllers/userController.js");
const { checkUserExist } = require("../middlewares/database/databaseErrorHelpers.js");
const { getAccessToRoute } = require("../middlewares/authorization/auth.js");

const router = express.Router();

//kullanici islemleri
router.get("/", getAllUsers);
router.get("/:id", checkUserExist, getSingleUser);

//favori islemleri
router.put("/:id/addToFavorites", getAccessToRoute, addToFavorites);
router.get("/:id/isFavorited", getAccessToRoute, isFavorited);
router.get("/:id/favorites", getAccessToRoute, getUserFavorites);

//takip islemleri
router.post("/:id/follow", getAccessToRoute, followUser);
router.post("/:id/unfollow", getAccessToRoute, unfollowUser);
router.get("/:id/followers", getFollowers);

//yorum islemleri
router.post("/:id/addComment", getAccessToRoute, commentOnRestaurant);                                          //id kismina restaurant id'si yazilacak.
router.delete("/:id/deleteComment", getAccessToRoute, deleteComment);                                           // id kismina comment id'si yazilacak.







module.exports = router;