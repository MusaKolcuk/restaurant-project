const express = require('express');

const { getAccessToRoute } = require('../middlewares/authorization/auth');
const { addNewAnswerToQuestion, getAllAnswersByQuestion, getSingleAnswer, editAnswer, deleteAnswer, likeAnswer, undoLikeAnswer } = require('../controllers/answerController');
const { checkQuestionAndAnswerExist } = require('../middlewares/database/databaseErrorHelpers');
const { getAnswerOwnerAccess } = require('../middlewares/authorization/auth');

const router = express.Router({mergeParams: true});     //mergeParams: true kullandık çünkü önceki routedaki parametreleri kullanmak istiyoruz eğer kullanmasaydık soru id'si alamayacaktık


router.post("/", getAccessToRoute, addNewAnswerToQuestion);
router.get("/", getAllAnswersByQuestion);
router.get("/:answer_id", checkQuestionAndAnswerExist, getSingleAnswer);
router.put("/:answer_id/edit", [checkQuestionAndAnswerExist, getAccessToRoute, getAnswerOwnerAccess], editAnswer);
router.delete("/:answer_id/delete", [checkQuestionAndAnswerExist, getAccessToRoute, getAnswerOwnerAccess], deleteAnswer);
router.get("/:answer_id/like", [checkQuestionAndAnswerExist, getAccessToRoute], likeAnswer);
router.get("/:answer_id/undo_like", [checkQuestionAndAnswerExist, getAccessToRoute], undoLikeAnswer);


// router.get('/', (req, res, next) => {
//     console.log(req.params);                            //burada req.params ile önceki routenin parametrelerine ulaşabiliyoruz
//     res.send("Answers Route");                          //burada answers route'a gelen isteklerin cevabı olarak "Answers Route" yazısını gönderdik
// });






module.exports = router;