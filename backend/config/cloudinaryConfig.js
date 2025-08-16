const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("./dotenv.config");

const cloudinary=require("cloudinary").v2
require("dotenv").config()
async function cloudinaryConfig(){
     // Configuration
     try{

         await cloudinary.config({ 
             cloud_name: CLOUDINARY_CLOUD_NAME, 
             api_key: CLOUDINARY_API_KEY, 
             api_secret: CLOUDINARY_API_SECRET 
             // Click 'View API Keys' above to copy your API secret
         });
         console.log("cloudinary configuration successful");
         
     }
     catch(error){
        console.log("error aa gaya");
        console.log(error);
        
        
     }
    }
module.exports= cloudinaryConfig