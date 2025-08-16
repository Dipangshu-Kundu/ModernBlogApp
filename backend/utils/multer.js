const multer=require("multer")

// const storage=multer.diskStorage({
//     destination:"uploads/",
//     filename:function(req,file,cb){
//         console.log(file);
//         cb(null,Date.now() + path.extname(file.originalname))
//     }
// })
const storage=multer.memoryStorage()

const upload=multer({
    storage
})
module.exports=upload