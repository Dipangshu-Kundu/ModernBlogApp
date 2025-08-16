const User = require("../models/userSchema")
const Blog = require("../models/blogSchema")
const bcrypt = require("bcrypt")
const { generateJWT, verifyJWT } = require("../utils/generateToken")
const ShortUniqueid = require("short-unique-id")
const { randomUUID } = new ShortUniqueid({ length: 5 })
const transporter = require("../utils/transporter")
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth")
const { deleteImageFromCloudinary, uploadImage } = require("../utils/uploadImage")
const { FIREBASE_TYPE, FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID, FIREBASE_AUTH_URI, FIREBASE_AUTH_PROVIDER_X509_CERT_URL, FIREBASE_CLIENT_X509_CERT_URL, FIREBASE_UNIVERSAL_DOMAIN, EMAIL_USER, FRONTEND_URL } = require("../config/dotenv.config")
admin.initializeApp({
    credential: admin.credential.cert({
        "type": FIREBASE_TYPE,
        "project_id": FIREBASE_PROJECT_ID,
        "private_key_id": FIREBASE_PRIVATE_KEY_ID,
        "private_key": FIREBASE_PRIVATE_KEY,
        "client_email": FIREBASE_CLIENT_EMAIL,
        "client_id": FIREBASE_CLIENT_ID,
        "auth_uri": FIREBASE_AUTH_URI,
        "token_uri": FIREBASE_AUTH_URI,
        "auth_provider_x509_cert_url": FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": FIREBASE_CLIENT_X509_CERT_URL,
        "universe_domain": FIREBASE_UNIVERSAL_DOMAIN
    }
    )
});

async function createUser(req, res) {
    const { name, password, email } = req.body
    try {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "please enter the name"
            })
        }
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "please enter the password"
            })
        }
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "please enter the email"
            })
        }
        // users.push({...req.body,id:users.length+1})

        const checkForexistingUser = await User.findOne({ email })

        if (checkForexistingUser) {
            if (checkForexistingUser.googleAuth) {
                return res.status(400).json({
                    success: true,
                    message: "This email already registered through google.please continue with google"
                })
            }
            if (checkForexistingUser.verify) {

                return res.status(400).json({
                    success: false,
                    message: "user already registered"
                })
            }
            else {
                let verificationToken = await generateJWT({
                    email: checkForexistingUser.email,
                    id: checkForexistingUser._id
                })

                //email logic
                const sendingEmail = transporter.sendMail({
                    from: EMAIL_USER,
                    to: checkForexistingUser.email,
                    subject: "Email Verification",
                    text: "Please verify your email",
                    html: `<h1>Click on the link to verify your email</h1>
            <a href='${FRONTEND_URL}/verify-email/${verificationToken}'>Verify Email</a>`
                })
                return res.status(200).json({
                    success: true,
                    message: "Please check your email to verify your account",

                })
            }
        }

        let salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt)
        const username = email.split("@")[0] + randomUUID()
        const newUser = await User.create({
            name, email, password: hashedPass,
            username
        });

        let verificationToken = await generateJWT({
            email: newUser.email,
            id: newUser._id
        })


        //email logic
        const sendingEmail = transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: "Email Verification",
            text: "Please verify your email",
            html: `<h1>Click on the link to verify your email</h1>
            <a href='${FRONTEND_URL}/verify-email/${verificationToken}'>Verify Email</a>`
        })
        return res.status(200).json({
            success: true,
            message: "Please check your email to verify your account",

        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "please try again",
            errror: err.message
        })
    }
}
async function verifyToken(req, res) {
    try {
        const { verificationToken } = req.params
        const verifyToken = await verifyJWT(verificationToken)
        if (!verifyToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid Token/email expired"
            })
        }
        const { email, id } = verifyToken
        const user = await User.findByIdAndUpdate(id, {
            verify: true
        },
            {
                new: true
            }
        )
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not exist"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Email Verified Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Please try again",
            error: error.message
        });
    }
}
async function googleAuth(req, res) {
    try {
        const { accessToken } = req.body;
        const response = await getAuth().verifyIdToken(accessToken)
        const { name, email } = response

        // let user = await User.findOne({ email })
        let user = await User.findOne({ email }).select("+googleAuth");

        if (user) {
            //already registered
            console.log(user.googleAuth);
            console.log(typeof (user.googleAuth));

            if (user.googleAuth) {

                let token = await generateJWT({
                    email: user.email,
                    id: user._id
                })
                return res.status(200).json({
                    success: true,
                    message: "Logged in successfully",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        username:user.username,
                        profilePic:user.profilePic,
                        showSavedBlogs:user.showSavedBlogs,
                        showLikedBlogs:user.showLikedBlogs,
                        token
                    },
                })
            }
            else {
                console.log(user);

                return res.status(400).json({
                    success: false,
                    message: "This email already registered.please try through login form"
                })
            }
        }
        const username = email.split("@")[0] + randomUUID();
        let newUser = await User.create({
            name, email,
            googleAuth: true,
            verify: true,
            username
        })
        let token = await generateJWT({
            email: newUser.email,
            id: newUser._id
        })
        return res.status(200).json({
            success: true,
            message: "Registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                profilePic:newUser.profilePic,
                showSavedBlogs:newUser.showSavedBlogs,
                showLikedBlogs:newUser.showLikedBlogs,
                token
            },
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Please try again2",
            error: error.message
        })
    }
}
async function login(req, res) {
    const { password, email } = req.body
    try {

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "please enter the password"
            })
        }
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "please enter the email"
            })
        }

        const checkForexistingUser = await User.findOne({ email }).select("password verify name email profilePic username bio showLikedBlogs showSavedBlogs")

        if (!checkForexistingUser) {
            return res.status(400).json({
                success: false,
                message: "user not exist"
            })
        }
        if (checkForexistingUser.googleAuth) {
            return res.status(400).json({
                success: true,
                message: "This email already registered through google.please continue with google"
            })
        }
        let checkforPass = await bcrypt.compare(password, checkForexistingUser.password,)
        if (!checkforPass) {
            return res.status(400).json({
                success: false,
                message: "password is wrong"
            })
        }
        if (!checkForexistingUser.verify) {
            //send verification email
            let verificationToken = await generateJWT({
                email: checkForexistingUser.email,
                id: checkForexistingUser._id
            })

            //email logic
            const sendingEmail = transporter.sendMail({
                from: EMAIL_USER,
                to: checkForexistingUser.email,
                subject: "Email Verification",
                text: "Please verify your email",
                html: `<h1>Click on the link to verify your email</h1>
            <a href='${FRONTEND_URL}/verify-email/${verificationToken}'>Verify Email</a>`
            })
            return res.status(400).json({
                success: false,
                message: "Please verify your email"
            })
        }
        let token = await generateJWT({
            email: checkForexistingUser.email,
            id: checkForexistingUser._id
        })
        return res.status(200).json({
            success: true,
            message: "login successfully",
            user: {
                id: checkForexistingUser._id,
                name: checkForexistingUser.name,
                email: checkForexistingUser.email,
                profilePic: checkForexistingUser.profilePic,
                username: checkForexistingUser.username,
                bio: checkForexistingUser.bio,
                showLikedBlog: checkForexistingUser.showLikedBlogs,
                showSavedBlog: checkForexistingUser.showSavedBlogs,
                token
            },
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "please try again",
            errror: err.message
        })
    }
}
async function getAllUsers(req, res) {
    try {

        const users = await User.find({}).populate("blogs")
        return res.status(200).json({
            success: true,
            message: "users fetched successfully",
            users
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "please try again",
            error: err.message
        })
    }
}
async function getUserById(req, res) {
    try {
        const username = req.params.username

        // const user=users.filter(user=>user.id==req.params.id)
        // const user = await User.findOne({ username }).populate("blogs followers following likeBlogs saveBlogs").populate({
        //     path: "followers",
        //     select: "name username"
        // }).
        //     select("-password -verify -__v -email -googleAuth")
        const user = await User.findOne({ username })
            .populate("blogs")
            .populate("following", "name username")
            .populate("likeBlogs")
            .populate("saveBlogs")
            .populate("followers", "name username")
            .select("-password -verify -__v -email -googleAuth");
        console.log(user);


        if (!user) {
            return res.status(200).json({
                success: false,
                message: "user not found",
                user
            })
        }

        return res.status(200).json({
            success: true,
            message: "users fetched successfully",
            user
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "please try again",
            error: err.message
        })
    }
}
async function updateUser(req, res) {
    try {

        const { id } = req.params
        // let index=blogs.findIndex(user=>user.id == id)
        // users[index]={...users[index],...req.body}
        const { name, username, bio } = req.body
        const image = req.file


        //validation


        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (!req.body.profilePic) {
            if (user.profilePicId) {
                await deleteImageFromCloudinary(user.profilePicId)
            }
            user.profilePic = null
            user.profilePicId = null
        }
        if (image) {

            const { secure_url, public_id } = await uploadImage(`data:image/jpeg;base64,${image.buffer.toString("base64")}`)

            user.profilePic = secure_url
            user.profilePicId = public_id
        }
        if (user.username !== username) {
            const findUser = await User.findOne({
                username
            })
            if (findUser) {
                return res.status(400).json({
                    success: false,
                    message: "Username already taken"
                })
            }

            user.username = username
        }
        user.name = name
        user.bio = bio
        await user.save()

        return res.json({
            message: "users updated successfully",
            user: {
                name: user.name,
                profilePic: user.profilePic,
                bio: user.bio,
                username: user.username
            }
        })
    } catch (err) {

        return res.status(200).json({
            success: false,
            message: "please try again"
        })
    }
}
async function deleteUser(req, res) {
    try {

        const { id } = req.params;
        // users = users.filter(user => user.id != id);  

        const deletedUser = await User.findOneAndDelete({ _id: id })
        console.log(deletedUser);
        if (!deletedUser) {
            return res.status(200).json({
                success: false,
                message: "User not found"
            })
        }
        return res.json({
            message: "user deleted successfully",
            deletedUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "please try again"
        })
    }
}
async function followUser(req, res) {
    try {
        const followerId = req.user;
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) {
            return res.status(500).json({
                message: "User is not found"
            })
        }
        if (!(user.followers.includes(followerId))) {
            await User.findByIdAndUpdate(id, {
                $set: { followers: followerId }
            })
            await User.findByIdAndUpdate(followerId, { $set: { following: id } })
            return res.status(200).json({
                success: true,
                message: "Following"
            })
        }
        else {
            await User.findByIdAndUpdate(id, {
                $unset: { followers: followerId }
            })
            await User.findByIdAndUpdate(followerId, { $unset: { following: id } })
            return res.status(200).json({
                success: false,
                message: "UnFollowed"

            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
async function changeSavedLikedBlog(req, res) {
    try {
        const userId = req.user;
        const user = await User.findById(userId)
        const { showLikedBlogs, showSavedBlogs } = req.body
        if (!user) {
            return res.status(500).json({
                message: "User is not found"
            })
        }

        await User.findByIdAndUpdate(userId, {
            showSavedBlogs, showLikedBlogs
        })
        return res.status(200).json({
            success: true,
            message: "Visibility Updated",
            showSavedBlogs,
            showLikedBlogs
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, login, verifyToken, googleAuth, followUser, changeSavedLikedBlog }

