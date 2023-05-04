const express = require("express");
const menuController = require("../controllers/menuController.js");
const asyncHandler = require("express-async-handler");
const {createMenu , getAllMenu, getDetailMenu, deleteMenu, updateMenu} = require("../controllers/menuController.js");
const { getAccessToRoute, getRestaurantOwnerAccess } = require("../middlewares/authorization/auth.js");



const router = express.Router();

router.post("/", getAccessToRoute, createMenu);
router.get("/", getAllMenu);
router.get("/:id", getDetailMenu);
router.delete("/:id", getAccessToRoute, deleteMenu);
router.put("/:id/updateMenu", getAccessToRoute, getRestaurantOwnerAccess, updateMenu);// buradaki id menu id'si degil restaurant id'si olacak




module.exports = router;