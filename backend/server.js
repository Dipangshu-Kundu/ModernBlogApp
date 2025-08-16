const express = require("express")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors");
const dbConnect=require("./config/dbConnect")
const User=require("./models/userSchema")
const userRoute=require("./routes/userRoutes")
const blogRoute=require("./routes/blogRoutes");
const cloudinaryConfig = require("./config/cloudinaryConfig");
const dotenv=require("dotenv");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config");
dotenv.config()
const port=PORT || 5000

app.use(express.json())
app.use(cors({origin:FRONTEND_URL}))

app.get("/",(req,res)=>{
    res.send("Hello ji kya hal hai ap sab ke");
    
})

app.use("/api/v1",userRoute)
app.use("/api/v1",blogRoute)


// NtMw3yps7aMhZgDl
let users = []

//blogs routes
let blogs = []


app.listen(port, () => {
    console.log("server started");
    dbConnect()
    cloudinaryConfig()
})