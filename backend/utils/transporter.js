const nodemailer = require("nodemailer")
const { EMAIL_HOST, EMAIL_PORT, EMAIL_PASS, EMAIL_USER } = require("../config/dotenv.config")

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }})
module.exports=transporter
