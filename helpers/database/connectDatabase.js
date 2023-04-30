const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDatabase = () => {

    mongoose.connect(process.env.MONGO_URI, {
        dbName : "question-answer",
        useNewUrlParser: true,
        useUnifiedTopology: true,           //performansi arttirir.

    })
    .then(() => {
        console.log("MongoDb Connection Successful");
    })
    .catch(err => {
        console.log(err);
    })
}

module.exports = connectDatabase;