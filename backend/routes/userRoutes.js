const express=require('express')
const {createUser, getUserById, updateUser, deleteUser, login, verifyToken, googleAuth, followUser, changeSavedLikedBlog} = require('../controllers/userController')
const User = require('../models/userSchema')
const route=express.Router()
const {getAllUsers}=require("../controllers/userController")
const verifyUser=require("../middlewares/auth")
const upload = require('../utils/multer')

route.post("/signup",createUser)
route.post("/signin",login)

route.get("/users", getAllUsers)

route.get("/users/:username", getUserById)
route.patch("/users/:id",verifyUser,upload.single("profilePic"),updateUser)
route.delete("/users/:id",verifyUser,deleteUser)

//verify email
route.get("/verify-email/:verificationToken",verifyToken)
//googleAuth route
route.post('/google-auth',googleAuth)

//follow/unfollow
route.patch("/follow/:id",verifyUser,followUser)
route.patch("/change-saved-liked-blog-visibility",verifyUser,changeSavedLikedBlog)

module.exports=route