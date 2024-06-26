const mongoose = require("mongoose");
const express = require("express");
const dotenv = require("dotenv");
const customErrorHandler = require("./middlewares/errors/customErrorHandler");
const path = require("path");
const connectDatabase = require("./helpers/database/connectDatabase");

const routes = require("./routes/indexRoute.js");


//Environment Variables

dotenv.config({
    path: "./config/.env"
});

//MongoDb Connection

connectDatabase();

const app = express();

//Express - Body Middleware
app.use(express.json());

const PORT = process.env.PORT;


//Routers Middlewares
app.use("/api",routes);

//Error Handler

app.use(customErrorHandler);

//Static Files
app.use(express.static(path.join(__dirname, "public")));    //bu sekilde public klasoru icerisindeki dosyalara ulasilabilir. Ornegin; localhost:5000/images/1.jpg



app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})