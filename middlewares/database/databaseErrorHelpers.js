const User = require("../../models/userModel");
const Question = require("../../models/questionModel");
const Answer = require("../../models/answerModel");
const Restaurant = require("../../models/restaurantModel");
const Menu = require("../../models/menuModel");
const CustomError = require("../../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

//bu fonksiyon ile kullanici var mi yok mu kontrol edilir.

const checkUserExist = asyncErrorWrapper(async (req, res, next) => {

    const {id} = req.params;
    const user = await User.findById(id);

    if(!user) {
        return next(new CustomError("There is no such user with that id", 400));
    }
    next();                                                                         //kullanici varsa next fonksiyonu ile bir sonraki fonksiyona gecilir.
});

//bu fonksiyon ile soru var mi yok mu kontrol edilir.
const checkQuestionExist = asyncErrorWrapper(async (req, res, next) => {

    const question_id = req.params.id || req.params.question_id;                    //eğer soru id'si url'de id olarak gelirse onu al yoksa question_id olarak gelirse onu al
    const question = await Question.findById(question_id);

    if(!question) {
        return next(new CustomError("There is no such question with that id", 400));
    }
    next();
});

//bu fonksiyon ile soru ve cevap var mi yok mu kontrol edilir.
const checkQuestionAndAnswerExist = asyncErrorWrapper(async (req, res, next) => {

    const question_id = req.params.question_id;
    const answer_id = req.params.answer_id;

    const answer = await Answer.findOne({                                           //findOne ile cevap id'si ve soru id'si ayni olan cevabi buluruz
        _id: answer_id,
        question: question_id
    });

    if(!answer) {
        return next(new CustomError("There is no answer with that id associated with question id", 400));
    }
    next();
});


module.exports = { checkUserExist, checkQuestionExist, checkQuestionAndAnswerExist,}