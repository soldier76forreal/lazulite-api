const express = require('express');
const mongoose = require("mongoose");
const multer = require('multer');
const verify = require("../users/verifyToken");
const productModel = require("../../models/productModel"); 
const featureListModel = require("../../models/featureListModel");
const userModel = require("../../models/userModel");
const dbConnection = require('../../connections/fa_connection');

const user = dbConnection.model("user" ,userModel);

var fs = require('fs');
var maxSize = 1 * 1000 * 1000;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,"public/uploads");
    },
    limits: { fileSize: maxSize },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0])
    }
  })

  const upload = multer({ storage: storage 
})
const router = express.Router()





//get all users
router.get("/getAllUsers" ,async(req , res)=>{
    try{
        const length = await user.countDocuments({deleteDate:null});
        const result = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').limit(parseInt(req.query.limit));        
        res.status(200).send(JSON.stringify({ln:length , rs:result})); 
    }catch(err){
        res.status(500).send("مشکلی رخ داده است");
    }
    
});


router.post("/validationUser" , async (req , res , next)=>{
    if(await user.findOne({_id:req.body.id , validation:true}).exec()){
        try{
            const response = await user.updateOne({_id:req.body.id} , {validation:false});
            const data = response;
            res.status(200).send(data);
            
         }catch(error){
              res.status(403).send("خطایی رخ داده است!");
     
         }
    }else{
        try{
            const response = await user.updateOne({_id:req.body.id} , {validation:true});
            const data = response;
            res.status(200).send(data);
            
         }catch(error){
             console.log(error);
              res.status(403).send("خطایی رخ داده است!");
     
         }
    }
    
});

router.post("/userRoleUpdate" , async (req , res , next)=>{
    console.log(req.body);
    try{
        const response = await user.updateOne({_id:req.body.id} , {role:req.body.label});
        res.status(200).send(response);
     }catch(error){
          res.status(403).send("خطایی رخ داده است!");
 
     }
    
});

router.post("/uploadUserImage"   , upload.single("images"), async (req , res , next)=>{
    
    try{
        const check = await user.findOne({_id:req.body.id}).select('profileImage');
        if(check.profileImage !== undefined){
            const result = await user.findOneAndUpdate({_id:req.body.id} , {profileImage:req.file , updateDate:Date.now()});
            fs.unlink(`public/uploads/${check.profileImage.filename}`, function (err) {
                if (err) throw err;
            });
            res.status(200).send(result);
        }else if(check.profileImage === undefined){
            const result = await user.findOneAndUpdate({_id:req.body.id} , {profileImage:req.file , updateDate:Date.now()});
            res.status(200).send(result);

        }

    }catch(error){
        res.status(500).send("مشکلی رخ داده است");
    }
});

router.post("/searchInUsers" , async (req , res , next)=>{
    user.aggregate([
            {$project: {"name" : { $concat : ["$firstName"," ","$lastName"]}  , 'deleteDate':'$deleteDate', insertDate:'$insertDate' , firstName:'$firstName' , lastName:'$lastName'  , role:"$role" , profileImage:"$profileImage" , validation:'$validation'}},
            {$match: {"name": {$regex: req.body.searching} , 'deleteDate':null}}
          ]).exec(function(err, result){
            if(err){
                res.status(500).send("مشکلی پیش آمده");
            }else{
                res.status(200).send(result);
            }
          });
});
module.exports = router;     