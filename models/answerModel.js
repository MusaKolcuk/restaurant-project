const mongoose = require("mongoose");
const Question = require("./questionModel");
const User = require("./userModel");

const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    content: {                                                                //cevap icerigi
        type: String,
        required: [true, "Please provide a content"],
        minlength: [20, "Please provide a title at least 20 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ],
    user: {                                                                    //soru sahibi kim
        type: mongoose.Schema.ObjectId,
        // required: true,                                                     //burada required kaldırıldı çünkü cevap veren kullanıcı silinirse cevaplarında silinmesi için
        ref: "User"
    },
    question: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Question"
    }
});

//bu fonksiyon ile cevap verilen sorunun cevaplarina cevap id'sini ekliyoruz
AnswerSchema.pre("save", async function (next) {                                    //cevap kaydedilmeden once
    if(!this.isModified("user")) return next();                                     //cevap icerigi degismemisse bir sonraki fonksiyona gec

        try {
            const question = await Question.findById(this.question);                //cevap verilen soruyu bul
            question.answers.push(this._id);                                        //cevap verilen sorunun cevaplarina cevap id'sini ekle
            question.answerCount = question.answers.length;                         //cevap sayisini guncelle

            await question.save();                                                  //soruyu kaydet
            next();
        } catch (err) {
            return next(err);
        }
});



module.exports = mongoose.model("Answer", AnswerSchema);