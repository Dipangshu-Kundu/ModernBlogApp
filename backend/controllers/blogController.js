const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const { verifyJWT } = require("../utils/generateToken");
const { uploadImage, deleteImageFromCloudinary } = require("../utils/uploadImage");
const fs = require("fs")
const uniqId = require("uniqid")
const ShortUniqueid = require("short-unique-id")
const { randomUUID } = new ShortUniqueid({ length: 10 })
//safe routes
async function createBlog(req, res) {
    try {
        

        const creator = req.user;
        const { title, description } = req.body;
        const draft= req.body.draft == "false"?false:true;
        const { image, images } = req.files
        const content = JSON.parse(req.body.content)
        const tags = JSON.parse(req.body.tags)


        if (!title) {
            return res.status(400).json({
                message: "please fill the title"
            })
        }
        if (!description) {
            return res.status(400).json({
                message: "please fill the description"
            })
        }
        if (!content) {
            return res.status(400).json({
                message: "please add some content"
            })
        }
        const findUser = await User.findById(creator);
        if (!findUser) {
            return res.status(500).json({
                message: "kon hai bhai tu"
            })
        }


        //cloudinary
        let imageIndex = 0;
        for (let i = 0; i < content.blocks.length; i++) {
            const block = content.blocks[i]
            if (block.type === "image") {

                console.log("hello");
                
                const { secure_url, public_id } = await uploadImage(
                    `data:image/jpeg;base64,${images[imageIndex].buffer.toString("base64")}`
                )
                console.log(secure_url, public_id);
                block.data.file = {
                    url: secure_url,
                    imageId: public_id
                }
                imageIndex++;

            }
        }

        const { secure_url, public_id } = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`)

        // fs.unlinkSync(image.path)


        const blogId = title.toLowerCase().split(" ").join("-") + "-" + randomUUID()

        const blog = await Blog.create({
            title, description, draft, creator, image: secure_url, imageId: public_id, blogId, content,tags
        })
        await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } })
        if(draft){
             return res.status(200).json({
            message: "Blog Saced as Draft. You can public it from your profile",
            blog
        })
        }
        return res.status(200).json({
            message: "blog created successfully",
            blog
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function getBlogs(req, res) {
    try {
        const page=parseInt(req.query.page)
        const limit=parseInt(req.query.limit)
        const skip=(page-1)*limit
        const blogs = await Blog.find({ draft: false }).populate({
            path: "creator",
            select: "-password"
        }).populate({
            path: "likes",
            select: "email name",

        })
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        const totalBlogs=await Blog.countDocuments({
            draft:false
        })
        return res.status(200).json({
            message: "blogs fetched successfully",
            blogs,
            hasMore:skip+limit<totalBlogs
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function getBlog(req, res) {
    try {
        const { blogId } = req.params
        const blog = await Blog.findOne({ blogId }).populate({
            path: "comments",
            populate: [{
                path: "user",
                select: "name email"
            },
                // {
                //     path: "replies",
                //     populate:{
                //         path:"user",
                //         select:"name email"
                //     }
                // }
            ]
        }).populate({
            path: "creator",
            select: "name email followers username"
        }).lean()
        // async function populateReplies(comments) {
        //     for (const comment of comments) {
        //         let populatedComment = await Comment.findById(comment._id).populate({
        //             path: "replies",
        //             populate: [{
        //                 path: "user",
        //                 select: "name email"
        //             }
        //             ]
        //         }).lean()
        //         comment.replies=populatedComment.replies
        //         if(comment.replies.length > 0){
        //             await populateReplies(comment.replies)
        //         }
        //     }
        //     return comments;
        // }
        async function populateReplies(comments = []) {
  for (const comment of comments) {
    const populatedComment = await Comment.findById(comment._id)
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .lean()

    comment.replies = populatedComment?.replies || []

    if (comment.replies.length > 0) {
      await populateReplies(comment.replies)
    }
  }
  return comments
}

        if (!blog) {
            return res.status(404).json({
                message: "blogs not found",
                blog
            })
        }
        blog.comments = await populateReplies(blog.comments)
        return res.status(200).json({
            message: "blogs fetched successfully",
            blog
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function updateBlog(req, res) {
    try {
        const creator = req.user;
        const { id } = req.params
        const { title, description } = req.body;
        const draft= req.body.draft == "false"?false:true;
        const user = await User.findById(creator).select("-password");
        const blog = await Blog.findOne({ blogId: id })
        const content = JSON.parse(req.body.content)
        const tags = JSON.parse(req.body.tags)
        const existingImages = JSON.parse(req.body.existingImages)
        if (!blog) {
            return res.status(404).json({
                message: "blog is not found"
            })
        }

        if (!(creator == blog.creator)) {
            return res.status(403).json({
                message: "you are not authorized for this action"
            })
        }


        let imagesToDelete = blog.content.blocks.filter((block) => block.type == "image").filter((block) => !existingImages.find(({ url }) => url == block.data.file.url)).map((block) => block.data.file.imageId)

        if (imagesToDelete.length > 0) {
            await Promise.all(
                imagesToDelete.map((id) => deleteImageFromCloudinary(id))
            )
        }

        if (req.files.images) {

            let imageIndex = 0;
            for (let i = 0; i < content.blocks.length; i++) {
                const block = content.blocks[i]
                if (block.type == "image" && block.data.file.image) {
                    const { secure_url, public_id } = await uploadImage(
                        `data:image/jpeg;base64,${req.files.images[imageIndex].buffer.toString("base64")}`
                    )
                    console.log(secure_url, public_id);
                    block.data.file = {
                        url: secure_url,
                        imageId: public_id
                    }
                    imageIndex++;

                }
            }
        }
        if (req.files.image) {
            await deleteImageFromCloudinary(blog.imageId)
            const { secure_url, public_id } = await uploadImage(`data:image/jpeg;base64,${req.files.image[0].buffer.toString("base64")}`)
            blog.image = secure_url
            blog.imageId = public_id

        }
        blog.title = title || blog.title
        blog.description = description || blog.description
        blog.draft = draft;
        blog.content = content || blog.content
        blog.tags = tags || blog.tags
        await blog.save();
        // const updatedBlog = await Blog.findByIdAndUpdate(id, { title, description, draft }, { new: true })
        if(draft){
             return res.status(200).json({
                success:true,
            message: "Blog Saced as Draft. You can again public it from your profile",
            blog
        })
        }
        return res.status(200).json({
            success: true,
            message: "blog updated successfully",
            blog
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function deleteBlog(req, res) {
    try {
        const creator = req.user;
        const { id } = req.params
        const blog = await Blog.findById(id)
        if (!blog) {
            return res.status(500).json({
                message: "blog is not found"
            })
        }
        if (!(creator == blog.creator)) {
            return res.status(500).json({
                message: "You are not authorized for this action"
            })
        }

        await deleteImageFromCloudinary(blog.imageId)
        await Blog.findByIdAndDelete(id);
        await User.findByIdAndUpdate(creator, {
            $pull: { blogs: id }
        })
        return res.status(200).json({
            success: true,
            message: "blog deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function likeBlog(req, res) {
    try {
        const user = req.user;
        const { id } = req.params
        const blog = await Blog.findById(id)
        if (!blog) {
            return res.status(500).json({
                message: "blog is not found"
            })
        }
        if (!(blog.likes.includes(user))) {
            await Blog.findByIdAndUpdate(id, {
                $push: { likes: user }
            })
            await User.findByIdAndUpdate(user,{$push:{likeBlogs:id}})
            return res.status(200).json({
                success: true,
                message: "Blog liked successfully",
                isLiked: true
            })
        }
        else {
            await Blog.findByIdAndUpdate(id, {
                $pull: { likes: user }
            })
            await User.findByIdAndUpdate(user,{$pull:{likeBlogs:id}})
            return res.status(200).json({
                success: false,
                message: "Blog disliked successfully",
                isLiked: false
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function saveBlog(req, res) {
    try {
        const user = req.user;
        const { id } = req.params
        const blog = await Blog.findById(id)
        if (!blog) {
            return res.status(500).json({
                message: "blog is not found"
            })
        }
        if (!(blog.totalSaves.includes(user))) {
            await Blog.findByIdAndUpdate(id, {
                $set: { totalSaves: user }
            })
            await User.findByIdAndUpdate(user,{$set:{saveBlogs:id}})
            return res.status(200).json({
                success: true,
                message: "Blog saved successfully",
                isLiked: true
            })
        }
        else {
            await Blog.findByIdAndUpdate(id, {
                $unset: { totalSaves: user }
            })
            await User.findByIdAndUpdate(user,{$unset:{saveBlogs:id}})
            return res.status(200).json({
                success: false,
                message: "Blog unsaved successfully",
                isLiked: false
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
// async function searchBlogs(req,res){
//     try{
//         const {search,tag}=req.query
//         //"i" means without case sensitive
//         const page=parseInt(req.query.page)
//         const limit=parseInt(req.query.limit)
//         const skip=(page-1)*limit
//         let query;
//         if(tag){
//             query={tags:tag}
//         }
//         else{
//             query={
//             $or:[
//                 {title:{$regex:search,$options:"i"}},
//                 {description:{$regex:search,$options:"i"}}
//             ]
//         }
//         }
//         const blogs=await Blog.find(query,
//     {
//         draft:false
//     }).sort({createdAt: -1})
//         .skip(skip)
//         .limit(limit)
//         if(blogs.length == 0){
//             return res.status(400).json({
//                 success:false,
//                 message:"Make sure all words are spelled correctly. Try different keywords. Try more general keywords",
//                 hasMore: false
//             })
//         }
//         const totalBlogs=await Blog.countDocuments(query,{
//             draft:false
//         })
//          return res.status(200).json({
//                 success:true,
//                 blogs,
//                 hasMore:skip+limit<totalBlogs
//             })

//     }catch(error){
//         return res.status(500).json({
//             message:error.message
//         })
//     }
// }
// async function searchBlogs(req, res) {
//     try {
//         const { search, tag } = req.query;
//         const page = parseInt(req.query.page);
//         const limit = parseInt(req.query.limit);
//         const skip = (page - 1) * limit;

//         let query;
//         if (tag) {
//             query = { tags: { $regex: tag, $options: "i" }, draft: false };
//         } else {
//             query = {
//                 draft: false,
//                 $or: [
//                     { title: { $regex: search, $options: "i" } },
//                     { description: { $regex: search, $options: "i" } }
//                 ]
//             };
//         }

//         const blogs = await Blog.find(query)
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limit);

//         if (blogs.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Make sure all words are spelled correctly. Try different keywords. Try more general keywords",
//                 hasMore: false
//             });
//         }

//         const totalBlogs = await Blog.countDocuments(query);

//         return res.status(200).json({
//             success: true,
//             blogs,
//             hasMore: skip + limit < totalBlogs
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message
//         });
//     }
// }
async function searchBlogs(req, res) {
    try {
        const { search, tag } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query;

        if (tag) {
            query = {
                draft: false,
                $or: [
                    { tags: { $regex: tag, $options: "i" } }, // tag in tags array
                    { title: { $regex: tag, $options: "i" } }, // tag in title
                    { description: { $regex: tag, $options: "i" } } // tag in description
                ]
            };
        } else if (search) {
            query = {
                draft: false,
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ]
            };
        } else {
            return res.status(400).json({ message: "No search or tag provided" });
        }

        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (blogs.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Make sure all words are spelled correctly. Try different keywords. Try more general keywords",
                hasMore: false
            });
        }

        const totalBlogs = await Blog.countDocuments(query);

        return res.status(200).json({
            success: true,
            blogs,
            hasMore: skip + limit < totalBlogs
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports = { createBlog, getBlogs, getBlog, updateBlog, deleteBlog, likeBlog,saveBlog,searchBlogs }

