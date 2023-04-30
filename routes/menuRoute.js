const express = require("express");
const menuController = require("../controllers/menuController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const asyncHandler = require("express-async-handler");
const {createMenu , getAllMenu, getDetailMenu, deleteMenu} = require("../controllers/menuController.js");

import express from "express";
import * as menuController from "../controllers/menuController.js"
import * as authMiddleware from "../middlewares/authMiddleware.js"

// import { createMenu, getAllMenus, updateMenu, deleteMenu } from "./menuController.js";

const router = express.Router();

router.route("/").post(authMiddleware.protect, menuController.createMenu);
router.route("/").get(menuController.getAllMenu);
router.route("/:id").get(menuController.getDetailMenu);

//buna bakılacak

router.route("/:id").delete(authMiddleware.protect, menuController.deleteMenu);

// router.route("/:id").put(authMiddleware.protect, restaurantController.updateRestaurant);


module.exports = router;