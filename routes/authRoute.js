const express = require("express");
const { createUser, login, getUser, logout, imageUpload, forgotPassword, resetPassword, editDetails} = require("../controllers/authController")
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const profileImageUpload = require("../middlewares/libraries/profileImageUpload");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", login);
router.get("/profile", getAccessToRoute, getUser);
router.get("/logout", getAccessToRoute, logout);
router.post("/forgotpassword",forgotPassword);
router.put("/resetpassword", resetPassword);
router.put("/edit", getAccessToRoute ,editDetails);

router.post("/upload", [getAccessToRoute, profileImageUpload.single("profile_image")],imageUpload); //single: tek dosya yukleme

module.exports = router;