const User = require("../models/userModel");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");


const getSingleUser = asyncErrorWrapper(async (req, res, next) => {

    const {id} = req.params;                                                                //id bilgisi url'den alinir.
    const user = await User.findById(id);                                                   //id bilgisi ile kullanici bilgileri alinir.

    return res.status(200)
    .json({
        success: true,
        data: user
});
});

const getAllUsers = asyncErrorWrapper(async (req, res, next) => {
    const users = await User.find();                                                        //tum kullanici bilgileri alinir.

    return res.status(200)
    .json({
        success: true,
        data: users
});
});

module.exports = { getSingleUser, getAllUsers, }