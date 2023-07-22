const multer = require('multer');
const path = require('path');
const CustomError = require('../../helpers/error/CustomError');
const  { v4: uuidv4 } = require('uuid');                                    //uuid: dosya isimlerini rastgele olusturmak icin kullanilir.

//Storage: Dosya yukleme islemini burada yapacagiz.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {                                                 //cb: callback
        const rootDir = path.dirname(require.main.filename);
        cb(null, path.join(rootDir, '/public/uploads/'));                                   //null: hata yoksa null, hata varsa hata mesaji   //path.join: pathleri birlestirir.
    }
    , filename: function (req, file, cb) {

        const extension = path.extname(file.originalname);                                  //path.extname: dosya uzantisi
        req.savedProfileImage = uuidv4() + extension;                                       //dosya ismi olusturulur.
        cb(null, req.savedProfileImage);
    }
});

// FileFilter: Dosya tipini kontrol edecegiz. Hangi dosyalara izin verecegimizi burada belirleyecegiz.

const fileFilter = (req, file, cb) => {
    let allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];                        //izin verilen dosya tipleri

    if (!allowedMimeTypes.includes(file.mimetype)) {                                        //dosya tipi izin verilenlerden biri degilse
        return cb(new CustomError('Please provide a valid image file', 400), false);        //hata mesaji dondurulur.
    }

    cb(null, true);
}


const ImageUpload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = ImageUpload