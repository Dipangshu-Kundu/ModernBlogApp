const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const mongoose=require("mongoose")
const User = require("../models/userSchema");
const { verifyJWT } = require("../utils/generateToken")
async function commentBlog(req, res) {
    try {
        const creator = req.user;
        const { id } = req.params
        const { comment } = req.body
        if (!comment) {
            return res.status(500).json({
                message: "please enter the comment"
            })
        }
        const blog = await Blog.findById(id)
        // console.log(blog);

        if (!blog) {
            return res.status(500).json({
                message: "blog is not found"
            })
        }
        console.log("hello");

        const newComment = await Comment.create({ comment, blog: id, user: creator }).then((comment) => {
            return comment.populate({
                path: "user",
                select: "name email"
            })
        })
        await Blog.findByIdAndUpdate(id, { $push: { comments: newComment._id } })
        return res.status(200).json({
            success: true,
            message: "comment added successfully",
            newComment
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function deleteComment(req, res) {
    try {
        const userId = req.user;
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid comment ID"
            });
        }
        const comment = await Comment.findById(id).populate({
            path: "blog",
            select: "creator"
        })

        if (!comment) {
            return res.status(404).json({
                message: "please enter the comment"
            })
        }
        if (!comment.user.equals(userId) && !comment.blog.creator.equals(userId)) {
             return res.status(403).json({
                success: false,
                message: "you are not authorized"
            });
        }
        async function deleteCommentAndReplies(id) {
            const comment = await Comment.findById(id)
            if (!comment) return; // prevent recursion error

            for (let replyId of comment.replies) {
                await deleteCommentAndReplies(replyId)
            }
            if(comment.parentComment){
                await Comment.findByIdAndUpdate(comment.parentComment,{
                    $pull:{
                        comments:id
                    }
                })
            }
            await Comment.findByIdAndDelete(id)
        }

        await deleteCommentAndReplies(id)
        await Blog.findByIdAndUpdate(comment.blog._id, { $pull: { comments: id } })

        return res.status(200).json({
            success: true,
            message: "comment deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function editComment(req, res) {
    try {
        const userId = req.user;
        const { id } = req.params
        const { updatedCommentContent } = req.body
        const comment = await Comment.findById(id)
        if (!comment) {
            return res.status(500).json({
                message: "Comment is not found"
            })
        }

        if (!(comment.user.equals(userId))) {
            return res.status(400).json({
                success: false,
                message: "you are not authorized"
            })
        }

       const updatedComment= await Comment.findByIdAndUpdate(id, { comment: updatedCommentContent },
        {
            new:true
        }
       ).then((comment) => {
            return comment.populate({
                path: "user",
                select: "name email"
            })
        })
        return res.status(200).json({
            success: true,
            message: "comment updated successfully",
            updatedComment
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function likeComment(req, res) {
    try {
        const userId = req.user;
        const { id } = req.params
        const comment = await Comment.findById(id)
        if (!comment) {
            return res.status(500).json({
                message: "comment is not found"
            })
        }
        if (!(comment.likes.includes(userId))) {
            await Comment.findByIdAndUpdate(id, {
                $push: { likes: userId }
            })
            return res.status(200).json({
                success: true,
                message: "Comment liked successfully",
                comment
            })
        }
        else {
            await Comment.findByIdAndUpdate(id, {
                $pull: { likes: userId }
            })
            return res.status(200).json({
                success: false,
                message: "Comment disliked successfully"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function nestedComment(req, res) {
    try {
        const userId = req.user;
        const { id: blogId, parentCommentId } = req.params
        const { reply } = req.body
        const comment = await Comment.findById(parentCommentId)
        const blog = await Blog.findById(blogId)
        if (!comment) {
            return res.status(500).json({
                message: "parent comment is not found"
            })
        }
        if (!blog) {
            return res.status(500).json({
                message: "blog is not found"
            })
        }
        const newReply = await Comment.create({
            blog: blogId,
            comment: reply,
            parentComment: parentCommentId,
            user: userId
        }).then((reply) => {
            return reply.populate({
                path: "user",
                select: "name email"
            })
        })
        await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: newReply._id } })
        return res.status(200).json({
            success: true,
            message: "reply added successfully",
            newReply
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
module.exports = { commentBlog, deleteComment, editComment, likeComment, nestedComment }