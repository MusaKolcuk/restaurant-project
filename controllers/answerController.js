const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");
const CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const addNewAnswerToQuestion = asyncErrorWrapper(async (req, res, next) => {
    const { question_id } = req.params;

    const { user_id } = req.user.id;

    const information = req.body;

    const answer = await Answer.create({                                    //Answer modelinden create metodu ile veritabanına bilgileri kaydettik
        ...information,                                                     //modelden gelen bilgileri information değişkenine atadık //spread operatoru(...)  ile bilgileri aldık

        question: question_id,
        user: user_id
});

    return res.status(200).json({
        success: true,
        data: answer
    });
});

const getAllAnswersByQuestion = asyncErrorWrapper(async (req, res, next) => {
    const { question_id } = req.params;

    const question = await Question.findById(question_id).populate("answers");   //populate ile cevaplarin bilgilerini aliriz

    const answers = question.answers;

    return res.status(200).json({
        success: true,
        count: answers.length,                                                   //cevap sayisini gosterir
        data: answers
    });
});

const getSingleAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;

    const answer = await Answer.findById(answer_id).populate({
        path: "question",                                                       //path ile hangi modelin bilgilerini almak istiyorsak onu belirtiyoruz
        select: "title"                                                         //sadece title bilgisini almak icin select kullandik
    })
    .populate({
        path: "user",
        select: "name profile_image"
    });

    return res.status(200).json({
        success: true,
        data: answer
    });
});

const editAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;

    const { content } = req.body;

    let answer = await Answer.findById(answer_id);

    answer.content = content;                                                       //güncellenen content bilgilerini content değişkenine atadık

    answer = await answer.save();

    return res.status(200).json({
        success: true,
        data: answer                                                                //güncellenen cevap bilgilerini gösterir
    });
});

const deleteAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;

    const { question_id } = req.params;

    await Answer.findByIdAndRemove(answer_id);

    const question = await Question.findById(question_id);

    question.answers.splice(question.answers.indexOf(answer_id), 1);               //splice ile cevap id'sini bulup cevaplar arasindan sileriz
    question.answerCount = question.answers.length;                                //cevap sayisini guncelleriz

    await question.save();

    return res.status(200).json({
        success: true,
        message: "Answer deleted successfully"
    });
});

const likeAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;

    const user_id = req.user.id;

    const answer = await Answer.findById(answer_id);

    if(answer.likes.includes(user_id)) {
        return next(new CustomError("You already liked this answer", 400));
    }

    answer.likes.push(user_id);

    await answer.save();

    return res.status(200).json({
        success: true,
        data: answer
    });
});


const undoLikeAnswer = asyncErrorWrapper(async (req, res, next) => {
    const { answer_id } = req.params;

    const user_id  = req.user.id;

    const answer = await Answer.findById(answer_id);

    if(!answer.likes.includes(user_id)) {
        return next(new CustomError("You can not undo like operation for this answer. You did not like this answer before.", 400));
    }

    const index = answer.likes.indexOf(user_id);

    answer.likes.splice(index, 1);

    await answer.save();

    return res.status(200).json({
        success: true,
        data: answer
    });
});




module.exports = { addNewAnswerToQuestion, getAllAnswersByQuestion, getSingleAnswer, editAnswer, deleteAnswer, likeAnswer, undoLikeAnswer, };
