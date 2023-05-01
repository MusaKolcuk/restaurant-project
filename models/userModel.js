const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken")
const crypto = require("crypto");                           //crypto modulu ile random string olusturacagiz. (reset password icin)
const Question = require("./questionModel");
const restaurantModel = require("./restaurantModel");
const Menu = require("./menuModel");

const UserSchema = new Schema({

    name: {
        type: String,
        required: [true, "Please provide a name"],          //normalde direkt required: true yazabilirdik fakat dizi icinde tanimlayarak eger deger girilmezse mesaj yazdirdik.
    },
    email: {
        type: String,
        required:[true, "Please provide a email"],
        unique: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,          //email icin regex
            "Please provide a valid email"
        ]
    },
    role: {
        type: String,
        default: "user",                                    //eger admin olarak ozellikle belirtilmezse default olarak user atanır.
        enum: ["user","admin"]
    },
    password: {
        type: String,
        minlength: [6, "Please provide a password wiht min length 6"],
        required: [true, "Please provide a password"],
        select: false,                                      //select false yapmamizin sebebi eger getAllUsers diye bir fonksiyon tanimlarsak password alanimizin degerinin gorulmemesi icin.
    },
    createdAt: {                                            //kullanicinin kayit oldugu zamani aliriz.
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
    },
    about: {
        type: String,
    },
    place: {
        type: String,
    },
    website: {
        type: String,
    },
    profile_image: {
        type: String,
        default: "default.jpg"
    },
    blocked: {                                                          //admin isterse bazi kullanicilarin hesaplarini bloke edebilir.
        type: Boolean,
        default: false,
    },
    favorites: [                                                        //kullanicinin favori restaurantlarini tutacagiz.
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant"
        }
    ],
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    }
});


//UserSchema Methods
//bu fonksiyon ile passwordu hashleyecegiz.
UserSchema.methods.generateJwtFromUser = function() {
    const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;

    const payload = {
        id: this._id,
        name: this.name,
        email: this.email
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, {               //jwt sign ile token olusturduk.
        expiresIn: JWT_EXPIRE
    });
    return token;
};

//bu fonksiyon ile girilen passwordun dogru olup olmadigini kontrol edecegiz.
UserSchema.methods.getResetPasswordTokenFromUser = function() {      //reset password token olusturmak icin fonksiyon tanimladik.
    const randomHexString = crypto.randomBytes(15).toString("hex");  //random hexadecimal string olusturduk. (15 byte)  (crypto modulu ile)  (toString ile hexadecimal stringe cevirdik).
    const { RESET_PASSWORD_EXPIRE } = process.env;                   //env dosyasindan reset password expire degerini aldik.

    const resetPasswordToken = crypto
        .createHash("SHA256")
        .update(randomHexString)
        .digest("hex");                                             //digest ile hexadecimal stringe cevirdik.

    this.resetPasswordToken = resetPasswordToken;                   //resetPasswordToken degiskenini user modeline ekledik.
    this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);         //1 saat sonra tokenin gecerliligi sona erecek.

    return resetPasswordToken;
};



//Pre Hooks

UserSchema.pre("save", function (next) {

    //Parola değismemis sadece user update islemleri yapildiysa
    if(!this.isModified("password")) {
        next();
    }

    const user = this;
    bcrypt.genSalt(10, (err, salt) => {
        if(err) next(err);                                          //hata yakalama fonksiyonu kullanildi.
        bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) next(err);
            user.password = hash;
            next();
        });
    });
});

//bu fonksiyon ile kullanici silinirken ona ait sorulari da sileriz.
UserSchema.post("remove", async function () {
    await Question.deleteMany({
        user: this._id
    });
});


module.exports = mongoose.model("User", UserSchema);