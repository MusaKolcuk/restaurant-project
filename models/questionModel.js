const mongoose = require("mongoose");
const slugify = require("slugify");


const Schema = mongoose.Schema;

const QuestionSchema = new Schema({

    title: {
        type: String,
        required: [true, "Please provide title"],
        minlength: [10, "Please provide a title at least 10 characters"],
        unique: true,
    },
    content: {
        type: String,
        required: [true, "Please provide a content"],
        minlength: [20, "Please provide a title at least 20 characters"]
    },
    slug: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {                                                                     //soru sahibi kim
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    likeCount: {                                                                //kaç kişi beğendi en çok beğenilen soruları göstermek için
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,                                     //like alanı içindeki kullanıcı id'lerini tutuyoruz
            ref: "User"                                                         //ref ile hangi model ile ilişkilendirdiğimizi belirtiyoruz
        }
    ],
    answerCount: {                                                              //kaç kişi cevapladı en çok cevaplanan soruları göstermek için
        type: Number,
        default: 0
    },
    answers: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Answer"
        }
    ]
});

QuestionSchema.pre("save", function (next) {
    if(!this.isModified("title")){                                              //title değişmemişse slug alanını değiştirmeye gerek yok, bu yüzden next() ile fonksiyonu sonlandırıyoruz
        next();
    }
    this.slug = this.makeSlug();                                                //title değişmişse slug alanını değiştiriyoruz
    next();
});
QuestionSchema.methods.makeSlug = function () {
    return slugify(this.title, {
        lower: true,
        replacement: "-",
        remove: /[*+~.()'"!:@]/g
    });
}


module.exports = mongoose.model("Question", QuestionSchema);