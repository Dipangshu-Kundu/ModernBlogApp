const express=require('express');
const { createBlog, getBlogs, getBlog, updateBlog, deleteBlog, likeBlog, saveBlog, searchBlogs} = require('../controllers/blogController');
const verifyUser = require('../middlewares/auth');
const { deleteComment, commentBlog, editComment, likeComment, nestedComment } = require('../controllers/commentController');
const upload = require('../utils/multer');

const route=express.Router()

console.log("blog");


route.post("/blogs", verifyUser,upload.fields([{name:"image",maxCount:1},{name:"images"}]),createBlog)
route.get("/blogs", getBlogs)
route.get("/blogs/:blogId", getBlog)
route.patch("/blogs/:id",verifyUser,upload.fields([{name:"image",maxCount:1},{name:"images"}]),updateBlog)
route.delete("/blogs/:id",verifyUser, deleteBlog)

route.post("/blogs/like/:id",verifyUser,likeBlog)

route.post("/blogs/comment/:id",verifyUser,commentBlog)
route.delete("/blogs/comment/:id",verifyUser,deleteComment)
route.patch("/blogs/edit-comment/:id",verifyUser,editComment)
route.patch("/blogs/like-comment/:id",verifyUser,likeComment)


//for nested comment
route.post('/comment/:parentCommentId/:id',verifyUser,nestedComment)

//save blog/bookmark
route.patch("/save-blog/:id",verifyUser,saveBlog)
module.exports=route

//search blogs
route.get("/search-blogs",searchBlogs)