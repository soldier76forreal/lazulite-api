const express = require('express');
const mongoose = require("mongoose");
const tagModel = require("../../models/tagModel");
const imageModel = require("../../models/imagesModel");
const videoModel = require("../../models/videoModel");
const multer = require('multer');
const verify = require("../users/verifyToken");
const courseModel = require("../../models/courseModel");
const dbConnection = require('../../connections/fa_connection');

var fs = require('fs');

const images = dbConnection.model("images" ,imageModel );
const video = dbConnection.model("video" ,videoModel );

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0])
    }
  })

  const upload = multer({ storage: storage 
})
const router = express.Router()

router.post("/uploadImage"  , verify , upload.single("images"), async (req , res , next)=>{

    var newImage = new images({
        metaData:req.file,
        author:req.body.author,
        imageName:req.file.originalname.split("." ,1).pop()
    })
    try{
        const result = await newImage.save();            
        res.status(200).send(result);
    }catch(error){
        res.status(500).send("مشکلی رخ داده است");
    }
});

router.get("/getImages", verify , async (req , res , next)=>{
    if(req.query.limit !== ''){
        try{
            const result =await images.find({deleteDate:null}).limit(parseInt(req.query.limit));
            const length =await images.countDocuments({deleteDate:null});
            res.status(200).send(JSON.stringify({ln:length , rs:result}));  
        }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }
});

router.post("/searchInImages", verify , async (req , res , next)=>{
    // var regex = new RegExp(req.body.searching, "i");
    if(req.body.searching){
        try{
            const searched = await images.find({
                deleteDate:null,
                "imageName" :   { "$regex": req.body.searching, "$options":"i"}
            }).limit(parseInt(20));
            res.status(200).send(searched);
        }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }

    }else{
        res.status(200).send([]);

    }
});

//delete category
router.post("/deleteImage", verify , async (req , res , next)=>{
    if(req.body.fileId){
        try{
            const result = await images.findOneAndUpdate({_id:req.body.fileId} , {deleteDate:Date.now()});
            fs.unlink(`public/uploads/${result.metaData.filename}`, function (err) {
                if (err) throw err;
            });
            res.status(200).send("تصویر حذف شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، تصویر حذف نشد");
        }
    }
});

//update image name
router.post("/updateImageName", verify , async (req , res , next)=>{
    if(req.body.id){
        try{
            const findImage = await images.findOne({_id:req.body.id});
            const format = findImage.metaData.originalname.split(".").pop();
            const newOriginalName = `${req.body.newName}.${format}`;
            console.log(newOriginalName);
            const result = await images.findOneAndUpdate({_id:req.body.id} , {'metaData.originalname': newOriginalName, imageName:req.body.newName , updateDate:Date.now()});
            res.status(200).send("نام ویرایش شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، نام ویرایش نشد");
        }
    }
});

//videos 
router.post("/uploadVideo" , verify  , upload.single("images"), async (req , res , next)=>{
    
    var newImage = new video({
        author:req.body.author,
        metaData:req.file,
        videoName:req.file.originalname.split("." ,1).pop()
    })
    try{
        const result = await newImage.save();            
        res.status(200).send(result);
    }catch(error){
        res.status(500).send("مشکلی رخ داده است");
    }
});

router.get("/getVideo", verify, async (req , res , next)=>{
    if(req.query.limit !== ''){
        try{
            const result =await video.find({deleteDate:null}).limit(parseInt(req.query.limit));
            const length =await video.countDocuments({deleteDate:null});
            res.status(200).send(JSON.stringify({ln:length , rs:result}));  
        }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }
});

router.post("/deleteVideo" , verify, async (req , res , next)=>{
    if(req.body.fileId){
        try{
          const result = await video.findOneAndUpdate({_id:req.body.fileId} , {deleteDate:Date.now()});
            res.status(200).send("تصویر حذف شد");
            fs.unlink(`public/uploads/${result.metaData.filename}`, function (err) {
                if (err) throw err;
            });
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، تصویر حذف نشد");
        }
    }
});
//update image name
router.post("/updateVideoName", verify , async (req , res , next)=>{
    if(req.body.id){
        try{
            const findImage = await video.findOne({_id:req.body.id});
            const format = findImage.metaData.originalname.split(".").pop();
            const newOriginalName = `${req.body.newName}.${format}`;
            console.log(newOriginalName);
            const result = await video.findOneAndUpdate({_id:req.body.id} , {'metaData.originalname': newOriginalName, videoName:req.body.newName , updateDate:Date.now()});
            res.status(200).send("نام ویرایش شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، نام ویرایش نشد");
        }
    }
});
router.post("/searchInVideo", verify , async (req , res , next)=>{
    // var regex = new RegExp(req.body.searching, "i");
    if(req.body.searching){
        try{
            const searched = await video.find({
                deleteDate:null,
                "videoName" :   { "$regex": req.body.searching, "$options":"i"}
            }).limit(parseInt(20));
            res.status(200).send(searched);
        }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }

    }else{
        res.status(200).send([]);

    }
});

module.exports = router;     

