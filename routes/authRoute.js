const express = require("express");
const { createUser, login, getUser, logout, imageUpload, forgotPassword, resetPassword, editDetails, deleteProfileIamge } = require("../controllers/authController")
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const ImageUpload = require("../middlewares/libraries/ImageUpload");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", login);
router.get("/profile", getAccessToRoute, getUser);
router.get("/logout", getAccessToRoute, logout);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.put("/edit", getAccessToRoute, editDetails);

router.post("/upload", [getAccessToRoute, ImageUpload.single("profile_image")], imageUpload); //single: tek dosya yukleme

router.put("/delete", getAccessToRoute, deleteProfileIamge);

module.exports = router;