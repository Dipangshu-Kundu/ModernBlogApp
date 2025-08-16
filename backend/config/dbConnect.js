const mongoose=require("mongoose");
const { DB_URL } = require("./dotenv.config");

require("dotenv").config()
async function dbConnect() {
    try {
        await mongoose.connect(DB_URL)
        console.log("db connected successfully");

    } catch (error) {
        console.log("error hai ea");
        console.log(error);
    }
}

module.exports=dbConnect