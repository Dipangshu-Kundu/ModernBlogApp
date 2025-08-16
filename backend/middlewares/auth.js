

const { verifyJWT } = require("../utils/generateToken")


async function verifyUser(req,res,next){
    try{
         let token=req.headers.authorization.split(" ")[1]
    //(Bearer user.token) is the form
    if(!token){
        return res.status(400).json({
            success:false,
            message:"please sign in"
        })
    }
    try{
        let user=await verifyJWT(token)
        
        if(!user){
            return res.status(400).json({
                success:false,
                message:"please sign in"
            })
        }
        req.user=user.id
        next()
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Authentication failed",
            error: err.message,
        });
    }
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"token missing"
        })
    }
   
}

module.exports=verifyUser