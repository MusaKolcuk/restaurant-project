const express = require("express");
const question = require("./questionRoute");
const auth = require("./authRoute");
const user = require("./userRoute");
const admin = require("./adminRoute");
const restaurant = require("./restaurantRoute");
const menu = require("./menuRoute");
//bu sayfada tum route'lar birlestirilir.
//api

const router = express.Router();

router.use("/questions", question);
router.use("/auth", auth);
router.use("/users", user)
router.use("/admin", admin);
router.use("/user", user);
router.use("/restaurant", restaurant);
router.use("/menu", menu);


module.exports = router;