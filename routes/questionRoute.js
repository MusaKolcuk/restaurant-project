const express = require("express");
const answers = require("./answerRoute");
const { getAllQuestions, askNewQuestion, getSingleQuestion, editQuestion, deleteQuestion, likeQuestion, undoLikeQuestion  } = require("../controllers/questionController");
const { checkQuestionExist } = require("../middlewares/database/databaseErrorHelpers");

const { getAccessToRoute, getQuestionOwnerAccess } = require("../middlewares/authorization/auth");          //kullanıcı giriş yapmış mı diye kontrol ediyoruz


const router = express.Router();


router.get("/", getAllQuestions);
router.post("/ask", getAccessToRoute, askNewQuestion);                                                      //ilk önce kullanıcı giriş yapmış mı diye kontrol ediyoruz, yaptıysa soru sorabilir
router.get("/:id", checkQuestionExist, getSingleQuestion);
router.put("/:id/edit", [getAccessToRoute, checkQuestionExist, getQuestionOwnerAccess], editQuestion);      //ilk önce kullanıcı giriş kontrolü sonra soru var mı kontrolü sonra soru sahibi mi kontrolü
router.delete("/:id/delete", [getAccessToRoute, checkQuestionExist, getQuestionOwnerAccess], deleteQuestion);
router.get("/:id/like", [getAccessToRoute, checkQuestionExist], likeQuestion);
router.get("/:id/undo_like", [getAccessToRoute, checkQuestionExist], undoLikeQuestion);

router.use("/:question_id/answers", checkQuestionExist, answers);                                            //answers.js dosyasındaki tüm routeların başına /:question_id/answers eklenir (örn: /:question_id/answers/

module.exports = router;