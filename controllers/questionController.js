const Question = require('../models/questionModel');                       //Question modelini çağırdık
const CustomError = require('../helpers/error/customError');
const asyncErrorWrapper = require('express-async-handler');                //async await kullanabilmek için express-async-handler kütüphanesini çağırdık


const getAllQuestions = asyncErrorWrapper(async (req, res, next) => {

    let query = Question.find();
    const populate = true;
    const populateObject = {path: "user", select: "name profile_image"};        //populateObject değişkeni ile user bilgilerini çekiyoruz

    //Search
    if(req.query.search){                                                      //search bilgisi url'den alinir. (localhost:5000/api/questions?search=deneme
        const searchObject = {};                                               //searchObject değişkeni oluşturduk
        const regex = new RegExp(req.query.search, "i");                       //regex değişkeni oluşturduk
        searchObject["title"] = regex;                                         //searchObject değişkeninin title bilgisini regex değişkenine atadık

        query = query.where(searchObject);                                     //query değişkenine searchObject değişkenini atadık
    }
    //Populate
    if(populate){                                                              //populate true ise
        query = query.populate(populateObject);
    }

    //Pagination

    const page = parseInt(req.query.page) || 1;                                 //parseInt ile string ifadeyi integer'a çevirdik sebebi ise req.query.page string ifade olarak gelir
    const limit = parseInt(req.query.limit) || 5;

    const startIndex = (page - 1) * limit;                                     //startIndex değişkeni ile sayfalama işlemi yapacağız  page -1 demek 1. sayfada 0. index'ten başla demek
    const endIndex = page * limit;                                             //endIndex değişkeni ile sayfalama işlemi yapacağız

    const pagination = {};                                                     //pagination objesi oluşturduk
    const total = await Question.countDocuments();                             //total değişkenine Question modelindeki toplam sayıyı atadık

    if(startIndex > 0){
        pagination.previous = {
            page: page - 1,
            limit: limit
        }
    }
    if(endIndex < total){
        pagination.next = {
            page: page + 1,                                                     // burada page + 1 dememizin sebebi 1. sayfada 0. index'ten başladığımız için 2. sayfada 5. index'ten başlamak için
            limit: limit
        }
    }

    query = query.skip(startIndex).limit(limit);                                //skip metodu ile startIndex ile  ve limit metodu ile sınırlandırdık

    const sortKey = req.query.sortBy;

    if (sortKey === "most-answered") {
        query = query.sort("-answerCount -createdAt");                          //sortKey bilgisi gelirse soruları cevap sayısına göre sıralar - işareti ile büyükten küçüğe doğru sıralar
    } else if (sortKey === "most-liked") {
        query = query.sort("-likeCount -createdAt");
    } else {
        query = query.sort("-createdAt");                                       //eğer sortKey bilgisi gelmezse en son eklenen soruları gösterir

    }


    const questions = await query;                                             //query değişkenini questions değişkenine atadık

    return res.status(200).json({
        success: true,
        count: questions.length,                                                //questions kaç değer döndürdüğünü gösterir
        pagination: pagination,                                                 //önceki sayfamız varsa previous objesini, sonraki sayfamız varsa next objesini döndürür
        data: questions
    });
});

const getSingleQuestion = asyncErrorWrapper(async (req, res, next) => {
    const {id} = req.params;                                                //id bilgisi url'den alinir.
    const question = await Question.findById(id);

    return res.status(200).json({
        success: true,
        data: question
    });
});


const askNewQuestion = asyncErrorWrapper(async (req, res, next) => {
    const information = req.body;                                           //body'den gelen bilgileri information değişkenine atadık

    const question = await Question.create({                                //Question modelinden create metodu ile veritabanına bilgileri kaydettik
        ...information,                                                     //modelden gelen bilgileri information değişkenine atadık //spread operatoru(...)  ile bilgileri aldık
        user: req.user.id
    });

    res.status(200).json({
        success: true,
        data: question
    });
});

const editQuestion = asyncErrorWrapper(async (req, res, next) => {
    const {id} = req.params;

    const {title, content} = req.body;                                      //body'den gelen bilgileri title ve content değişkenlerine atadık

    let question = await Question.findById(id);

    question.title = title;                                                 //güncellenen title bilgilerini title değişkenine atadık
    question.content = content;                                             //güncellenen content bilgilerini content değişkenine atadık

    question = await question.save();                                       //editlenmis question bilgilerini kaydettik

    return res.status(200).json({
        success: true,
        data: question
    });
});

const deleteQuestion = asyncErrorWrapper(async (req, res, next) => {
    const {id} = req.params;

    const question = await Question.findByIdAndDelete(id);


    return res.status(200).json({
        success: true,
        message: "Question Delete Operation Successful"
    });
});


const likeQuestion = asyncErrorWrapper(async (req, res, next) => {
    const {id} = req.params;

    const question = await Question.findById(id);

    if(question.likes.includes(req.user.id)){                                                           //kullanıcı daha önce like'a basmışsa
        return next(new CustomError("You already liked this question", 400));                           //hata mesajı döndürür
    }
    question.likes.push(req.user.id);                                                                   //kullanıcı daha önce like'a basmamışsa like'a basar
    question.likeCount = question.likes.length;                                                         //like'a basılan kullanıcı sayısını likeCount değişkenine atar

    await question.save();                                                                              //like'a basılan question bilgilerini kaydeder

    return res.status(200).json({
        success: true,
        data: question
});
});

const undoLikeQuestion = asyncErrorWrapper(async (req, res, next) => {
    const {id} = req.params;

    const question = await Question.findById(id);

    if(!question.likes.includes(req.user.id)){                                                          //kullanıcı daha önce like'a basmamışsa
        return next(new CustomError("You can not undo like operation for this question", 400));         //hata mesajı döndürür
    }
    const index = question.likes.indexOf(req.user.id);                                                  //kullanıcı daha önce like'a basmışsa like'a basmayı geri alır

    question.likes.splice(index, 1);                                                                    //splice metodu ile index numarasından itibaren 1 tane eleman siler
    question.likeCount = question.likes.length;                                                         //like'a basılan kullanıcı sayısını likeCount değişkenine atar

    await question.save();                                                                              //like'a basmayı geri alan question bilgilerini kaydeder

    return res.status(200).json({
        success: true,
        data: question
    });


});



module.exports = { getAllQuestions, getSingleQuestion, askNewQuestion, editQuestion, deleteQuestion, likeQuestion, undoLikeQuestion }



