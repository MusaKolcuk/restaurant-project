const CustomError = require("../../helpers/error/CustomError");
const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const Question = require("../../models/questionModel");
const Answer = require("../../models/answerModel");
const asyncErrorWrapper = require("express-async-handler");
const {isTokenIncluded, getAccessTokenFromHeader} = require("../../helpers/authorization/tokenHelpers");

//bu fonksiyon ile kullanici giriş yapmış mı diye kontrol edilir.
const getAccessToRoute = (req, res, next) => {

    const {JWT_SECRET_KEY} = process.env;
    if(!isTokenIncluded(req)) {                         //token gonderilmemisse
        return next(new CustomError("You are not authorized to access this route", 401));  //401 unauthorized hatasi dondurulur.
    }

    const access_token = getAccessTokenFromHeader(req); //token gonderilmisse token degiskenine atilir.

    jwt.verify(access_token, process.env.JWT_SECRET_KEY, (err, decoded) => {  //token dogrulanir.
        if(err) {
            return next
                (new CustomError("You are not authorized to access this route", 401));
        }
        req.user = {                                     //token dogrulandiktan sonra kullanici bilgileri req.user degiskenine atilir.
            id: decoded.id,
            name: decoded.name,
            email: decoded.email
        }

        next();
})
};

//bu fonksiyon ile admin giriş yapmış mı diye kontrol edilir.
const getAdminAccess = asyncErrorWrapper (async(req, res, next) => {

    const {id} = req.user;

    const user = await User.findById(id)

    if(user.role !== "admin") {
        return next(new CustomError("Only admins can access this route",403));
    }
    next();
});

//bu fonksiyon ile soru sahibi sadece soruyu guncelleyebilir.
const getQuestionOwnerAccess = asyncErrorWrapper (async(req, res, next) => {

    const userId = req.user.id;
    const questionId = req.params.id;

    const question = await Question.findById(questionId);

    if (question.user != userId) {                                                          //kullanici id ile soru id ayni degilse
        return next(new CustomError("Only owner can handle this operation",403));
    }
    next();
});

//bu fonksiyon ile cevap sahibi sadece cevabi guncelleyebilir.
const getAnswerOwnerAccess = asyncErrorWrapper (async(req, res, next) => {

    const userId = req.user.id;
    const answerId = req.params.answer_id;

    const answer = await Answer.findById(answerId);                                         //cevap id'si ile cevabi buluruz

    if (answer.user != userId) {                                                            //kullanici id ile cevap id ayni degilse
        return next(new CustomError("Only owner can handle this operation",403));
    }
    next();
});


module.exports = { getAccessToRoute, getAdminAccess, getQuestionOwnerAccess, getAnswerOwnerAccess,  };