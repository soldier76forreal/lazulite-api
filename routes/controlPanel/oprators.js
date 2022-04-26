const express = require('express');
const mongoose = require("mongoose");
const tagModel = require("../../models/tagModel");
const imageModel = require("../../models/imagesModel");
const {opratorModel} = require("../../models/opratorModel");
const {whatsAppOpratorModel} = require("../../models/opratorModel");
const multer = require('multer');
const verify = require("../users/verifyToken");
const courseModel = require("../../models/courseModel");
const userModel = require('../../models/userModel')
const dbConnection = require('../../connections/fa_connection');
const dbConnection2 = require('../../connections/ar_connection');
const dbConnection3 = require('../../connections/en_connection');

const opratorM = dbConnection.model("oprator" ,opratorModel);
const waOpratorM = dbConnection.model("whatsAppOprator" ,whatsAppOpratorModel);
const user = dbConnection.model("user" ,userModel);

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

router.post("/newOprator" , verify  ,  async (req , res , next)=>{

    var newOprator = new opratorM({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phoneNumbers:req.body.phoneNumbers,
        author:req.body.author
    })
    try{
        const result = await newOprator.save();            
        res.status(200).send("اپراتور ذخیره شد");
    }catch(error){
        console.log(error);
        res.status(500).send("مشکلی رخ داده است");
    }
});


router.get("/getOprators", verify , async (req , res , next)=>{
    if(req.query.limit !== ''){
        try{
            const result =await opratorM.find({deleteDate:null}).limit(parseInt(req.query.limit));
            const length =await opratorM.countDocuments({deleteDate:null});
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({oprator:result[i] , author:rs2[j]});
                    }
                }
            }
            
            res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
            }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }
});


router.post("/opSearch", verify , async (req , res , next)=>{

        try{
            const result =await opratorM.aggregate([
                {$project: {"name" : { $concat : ["$firstName"," ","$lastName"]}  , 'deleteDate':'$deleteDate', insertDate:'$insertDate' , firstName:'$firstName' , lastName:'$lastName' , phoneNumbers:"$phoneNumbers" , author: "$author", contactRequest:'$contactRequest'}},
                {$match: {"name": {$regex: req.body.searching} , 'deleteDate':null}}
            ]);
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({oprator:result[i] , author:rs2[j]});
                    }
                }
            }
            res.status(200).send(JSON.stringify(finalArr)); 
        }catch{
            res.status(500).send("مشکلی پیش آمده"); 
        }
    
});


// router.get("/getOprator" , async (req , res , next)=>{
//         try{
//             const result =await opratorModel.findOne({_id:req.query.opratorId});
//             res.status(200).send(result);  
//         }catch(err){
//             res.status(500).send("مشکلی پیش آمده");
//         }
// });


router.post("/updateOprator", verify , async (req , res , next)=>{
    try{
        const result =await opratorM.updateOne({_id:req.body.id} , {'$set': {
             'firstName' : req.body.firstName,
             'lastName':req.body.lastName,
            'phoneNumbers': req.body.phoneNumbers,
        }});
        res.status(200).send(result);  
    }catch(err){
        res.status(500).send("مشکلی پیش آمده");
    }
});

//delete category
router.post("/deleteOprator", verify , async (req , res , next)=>{
    if(req.body.opratorId){
        try{
           await opratorM.findOneAndUpdate({_id:req.body.opratorId} , {deleteDate:Date.now()});
           const length =await opratorM.countDocuments({deleteDate:null});
            res.status(200).send({msg:"اپراتور حذف شد" , ln:length});
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، اپراتور حذف نشد");
        }
    }
});

router.post("/newWaOprator", verify  ,  async (req , res , next)=>{

    var newOprator = new waOpratorM({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phoneNumber:req.body.phoneNumber,
        author:req.body.author
    })
    try{
        const result = await newOprator.save();            
        res.status(200).send("اپراتور ذخیره شد");
    }catch(error){
        console.log(error);
        res.status(500).send("مشکلی رخ داده است");
    }
});


router.get("/getWaOprators" , verify, async (req , res , next)=>{

    if(req.query.limit !== ''){
        try{
            const result =await waOpratorM.find({deleteDate:null}).limit(parseInt(req.query.limit));
            const length =await waOpratorM.countDocuments({deleteDate:null});
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({waOprator:result[i] , author:rs2[j]});
                    }
                }
            }
            res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
            }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }
});


router.post("/waOpSearch", verify , async (req , res , next)=>{
    try{
        const result =await waOpratorM.aggregate([
            {$project: {"name" : { $concat : ["$firstName"," ","$lastName"]}  , 'deleteDate':'$deleteDate', insertDate:'$insertDate' , firstName:'$firstName' , lastName:'$lastName' , phoneNumber:"$phoneNumber" , author: "$author", contactRequest:'$contactRequest'}},
            {$match: {"name": {$regex: req.body.searching} , 'deleteDate':null}}
        ]);
        var authorIds =[];
        var finalArr  = [];
        for(var i = 0 ; result.length > i ; i++){
            authorIds.push(result[i].author);
        }
        const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
        for(var i = 0 ; result.length > i ; i++){
            for(var j = 0 ; rs2.length > j ; j++){
                if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                    finalArr.push({waOprator:result[i] , author:rs2[j]});
                }
            }
        }
        res.status(200).send(JSON.stringify(finalArr)); 
    }catch{
        res.status(500).send("مشکلی پیش آمده"); 
    }
        
});


// router.get("/getWaOprator" , async (req , res , next)=>{
//         try{
//             const result =await opratorModel.findOne({_id:req.query.opratorId});
//             res.status(200).send(result);  
//         }catch(err){
//             res.status(500).send("مشکلی پیش آمده");
//         }
// });


router.post("/updateWaOprator", verify , async (req , res , next)=>{
    try{
        const result =await waOpratorM.updateOne({_id:req.body.id} , {'$set': {
             'firstName' : req.body.firstName,
             'lastName':req.body.lastName,
            'phoneNumber': req.body.phoneNumber,
        }});
        res.status(200).send(result);  
    }catch(err){
        res.status(500).send("مشکلی پیش آمده");
    }
});

//delete category
router.post("/deleteWaOprator", verify , async (req , res , next)=>{
    if(req.body.opratorId){
        try{
           await waOpratorM.findOneAndUpdate({_id:req.body.opratorId} , {deleteDate:Date.now()});
           const length =await waOpratorM.countDocuments({deleteDate:null});
            res.status(200).send({msg:"اپراتور حذف شد" , ln:length});
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، اپراتور حذف نشد");
        }
    }
});

//------------************ main web api ************------------
router.post('/newCallRequestMain' , async (req , res ) =>{
    try{
        await opratorM.updateOne({_id:req.body.targetId} , {$push:{contactRequest:{phoneNumber:req.body.phoneNumber  , called:false}}});
        res.status(200).send('درخواست ثبت شد');
    }catch{
        res.status(401).send('خطا!مشکلی پیش آمده');
    }
})






//---------------------------------------------------------------Arabic---------------------------------------------------------


const opratorMAr = dbConnection2.model("oprator" ,opratorModel);
const waOpratorMAr = dbConnection2.model("whatsAppOprator" ,whatsAppOpratorModel);


router.post("/newOpratorAr" , verify  ,  async (req , res , next)=>{

    var newOprator = new opratorMAr({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phoneNumbers:req.body.phoneNumbers,
        author:req.body.author
    })
    try{
        const result = await newOprator.save();            
        res.status(200).send("اپراتور ذخیره شد");
    }catch(error){
        console.log(error);
        res.status(500).send("مشکلی رخ داده است");
    }
});


router.get("/getOpratorsAr", verify , async (req , res , next)=>{
    if(req.query.limit !== ''){
        try{
            const result =await opratorMAr.find({deleteDate:null}).limit(parseInt(req.query.limit));
            const length =await opratorMAr.countDocuments({deleteDate:null});
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({oprator:result[i] , author:rs2[j]});
                    }
                }
            }
            
            res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
            }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }
});


router.post("/opSearchAr", verify , async (req , res , next)=>{

        try{
            const result =await opratorMAr.aggregate([
                {$project: {"name" : { $concat : ["$firstName"," ","$lastName"]}  , 'deleteDate':'$deleteDate', insertDate:'$insertDate' , firstName:'$firstName' , lastName:'$lastName' , phoneNumbers:"$phoneNumbers" , author: "$author", contactRequest:'$contactRequest'}},
                {$match: {"name": {$regex: req.body.searching} , 'deleteDate':null}}
            ]);
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({oprator:result[i] , author:rs2[j]});
                    }
                }
            }
            res.status(200).send(JSON.stringify(finalArr)); 
        }catch{
            res.status(500).send("مشکلی پیش آمده"); 
        }
    
});


// router.get("/getOprator" , async (req , res , next)=>{
//         try{
//             const result =await opratorModel.findOne({_id:req.query.opratorId});
//             res.status(200).send(result);  
//         }catch(err){
//             res.status(500).send("مشکلی پیش آمده");
//         }
// });


router.post("/updateOpratorAr", verify , async (req , res , next)=>{
    try{
        const result =await opratorMAr.updateOne({_id:req.body.id} , {'$set': {
             'firstName' : req.body.firstName,
             'lastName':req.body.lastName,
            'phoneNumbers': req.body.phoneNumbers,
        }});
        res.status(200).send(result);  
    }catch(err){
        res.status(500).send("مشکلی پیش آمده");
    }
});

//delete category
router.post("/deleteOpratorAr", verify , async (req , res , next)=>{
    if(req.body.opratorId){
        try{
           await opratorMAr.findOneAndUpdate({_id:req.body.opratorId} , {deleteDate:Date.now()});
           const length =await opratorMAr.countDocuments({deleteDate:null});
            res.status(200).send({msg:"اپراتور حذف شد" , ln:length});
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، اپراتور حذف نشد");
        }
    }
});














router.post("/newWaOpratorAr", verify  ,  async (req , res , next)=>{

    var newOprator = new waOpratorMAr({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phoneNumber:req.body.phoneNumber,
        author:req.body.author
    })
    try{
        const result = await newOprator.save();            
        res.status(200).send("اپراتور ذخیره شد");
    }catch(error){
        console.log(error);
        res.status(500).send("مشکلی رخ داده است");
    }
});


router.get("/getWaOpratorsAr" , verify, async (req , res , next)=>{

    if(req.query.limit !== ''){
        try{
            const result =await waOpratorMAr.find({deleteDate:null}).limit(parseInt(req.query.limit));
            const length =await waOpratorMAr.countDocuments({deleteDate:null});
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({waOprator:result[i] , author:rs2[j]});
                    }
                }
            }
            res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
            }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }
});


router.post("/waOpSearchAr", verify , async (req , res , next)=>{
    try{
        const result =await waOpratorMAr.aggregate([
            {$project: {"name" : { $concat : ["$firstName"," ","$lastName"]}  , 'deleteDate':'$deleteDate', insertDate:'$insertDate' , firstName:'$firstName' , lastName:'$lastName' , phoneNumber:"$phoneNumber" , author: "$author", contactRequest:'$contactRequest'}},
            {$match: {"name": {$regex: req.body.searching} , 'deleteDate':null}}
        ]);
        var authorIds =[];
        var finalArr  = [];
        for(var i = 0 ; result.length > i ; i++){
            authorIds.push(result[i].author);
        }
        const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
        for(var i = 0 ; result.length > i ; i++){
            for(var j = 0 ; rs2.length > j ; j++){
                if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                    finalArr.push({waOprator:result[i] , author:rs2[j]});
                }
            }
        }
        res.status(200).send(JSON.stringify(finalArr)); 
    }catch{
        res.status(500).send("مشکلی پیش آمده"); 
    }
        
});


// router.get("/getWaOprator" , async (req , res , next)=>{
//         try{
//             const result =await opratorModel.findOne({_id:req.query.opratorId});
//             res.status(200).send(result);  
//         }catch(err){
//             res.status(500).send("مشکلی پیش آمده");
//         }
// });


router.post("/updateWaOpratorAr", verify , async (req , res , next)=>{
    try{
        const result =await waOpratorMAr.updateOne({_id:req.body.id} , {'$set': {
             'firstName' : req.body.firstName,
             'lastName':req.body.lastName,
            'phoneNumber': req.body.phoneNumber,
        }});
        res.status(200).send(result);  
    }catch(err){
        res.status(500).send("مشکلی پیش آمده");
    }
});

//delete category
router.post("/deleteWaOpratorAr", verify , async (req , res , next)=>{
    if(req.body.opratorId){
        try{
           await waOpratorMAr.findOneAndUpdate({_id:req.body.opratorId} , {deleteDate:Date.now()});
           const length =await waOpratorMAr.countDocuments({deleteDate:null});
            res.status(200).send({msg:"اپراتور حذف شد" , ln:length});
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، اپراتور حذف نشد");
        }
    }
});

//------------************ main web api ************------------
router.post('/newCallRequestMainAr' , async (req , res ) =>{
    try{
        await opratorMAr.updateOne({_id:req.body.targetId} , {$push:{contactRequest:{phoneNumber:req.body.phoneNumber  , called:false}}});
        res.status(200).send('درخواست ثبت شد');
    }catch{
        res.status(401).send('خطا!مشکلی پیش آمده');
    }
})

//---------------------------------------------------------------English---------------------------------------------------------


const opratorMEn = dbConnection3.model("oprator" ,opratorModel);
const waOpratorMEn = dbConnection3.model("whatsAppOprator" ,whatsAppOpratorModel);


router.post("/newOpratorEn" , verify  ,  async (req , res , next)=>{

    var newOprator = new opratorMEn({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phoneNumbers:req.body.phoneNumbers,
        author:req.body.author
    })
    try{
        const result = await newOprator.save();            
        res.status(200).send("اپراتور ذخیره شد");
    }catch(error){
        console.log(error);
        res.status(500).send("مشکلی رخ داده است");
    }
});


router.get("/getOpratorsEn", verify , async (req , res , next)=>{
    if(req.query.limit !== ''){
        try{
            const result =await opratorMEn.find({deleteDate:null}).limit(parseInt(req.query.limit));
            const length =await opratorMEn.countDocuments({deleteDate:null});
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({oprator:result[i] , author:rs2[j]});
                    }
                }
            }
            
            res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
            }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }
});


router.post("/opSearchEn", verify , async (req , res , next)=>{

        try{
            const result =await opratorMEn.aggregate([
                {$project: {"name" : { $concat : ["$firstName"," ","$lastName"]}  , 'deleteDate':'$deleteDate', insertDate:'$insertDate' , firstName:'$firstName' , lastName:'$lastName' , phoneNumbers:"$phoneNumbers" , author: "$author", contactRequest:'$contactRequest'}},
                {$match: {"name": {$regex: req.body.searching} , 'deleteDate':null}}
            ]);
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({oprator:result[i] , author:rs2[j]});
                    }
                }
            }
            res.status(200).send(JSON.stringify(finalArr)); 
        }catch{
            res.status(500).send("مشکلی پیش آمده"); 
        }
    
});


// router.get("/getOprator" , async (req , res , next)=>{
//         try{
//             const result =await opratorModel.findOne({_id:req.query.opratorId});
//             res.status(200).send(result);  
//         }catch(err){
//             res.status(500).send("مشکلی پیش آمده");
//         }
// });


router.post("/updateOpratorEn", verify , async (req , res , next)=>{
    try{
        const result =await opratorMEn.updateOne({_id:req.body.id} , {'$set': {
             'firstName' : req.body.firstName,
             'lastName':req.body.lastName,
            'phoneNumbers': req.body.phoneNumbers,
        }});
        res.status(200).send(result);  
    }catch(err){
        res.status(500).send("مشکلی پیش آمده");
    }
});

//delete category
router.post("/deleteOpratorEn", verify , async (req , res , next)=>{
    if(req.body.opratorId){
        try{
           await opratorMEn.findOneAndUpdate({_id:req.body.opratorId} , {deleteDate:Date.now()});
           const length =await opratorMEn.countDocuments({deleteDate:null});
            res.status(200).send({msg:"اپراتور حذف شد" , ln:length});
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، اپراتور حذف نشد");
        }
    }
});














router.post("/newWaOpratorEn", verify  ,  async (req , res , next)=>{

    var newOprator = new waOpratorMEn({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        phoneNumber:req.body.phoneNumber,
        author:req.body.author
    })
    try{
        const result = await newOprator.save();            
        res.status(200).send("اپراتور ذخیره شد");
    }catch(error){
        console.log(error);
        res.status(500).send("مشکلی رخ داده است");
    }
});


router.get("/getWaOpratorsEn" , verify, async (req , res , next)=>{

    if(req.query.limit !== ''){
        try{
            const result =await waOpratorMEn.find({deleteDate:null}).limit(parseInt(req.query.limit));
            const length =await waOpratorMEn.countDocuments({deleteDate:null});
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; result.length > i ; i++){
                authorIds.push(result[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
            for(var i = 0 ; result.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({waOprator:result[i] , author:rs2[j]});
                    }
                }
            }
            res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
            }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }
});


router.post("/waOpSearchEn", verify , async (req , res , next)=>{
    try{
        const result =await waOpratorMEn.aggregate([
            {$project: {"name" : { $concat : ["$firstName"," ","$lastName"]}  , 'deleteDate':'$deleteDate', insertDate:'$insertDate' , firstName:'$firstName' , lastName:'$lastName' , phoneNumber:"$phoneNumber" , author: "$author", contactRequest:'$contactRequest'}},
            {$match: {"name": {$regex: req.body.searching} , 'deleteDate':null}}
        ]);
        var authorIds =[];
        var finalArr  = [];
        for(var i = 0 ; result.length > i ; i++){
            authorIds.push(result[i].author);
        }
        const rs2 = await user.find({deleteDate:null}).where('_id').in(authorIds);
        for(var i = 0 ; result.length > i ; i++){
            for(var j = 0 ; rs2.length > j ; j++){
                if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                    finalArr.push({waOprator:result[i] , author:rs2[j]});
                }
            }
        }
        res.status(200).send(JSON.stringify(finalArr)); 
    }catch{
        res.status(500).send("مشکلی پیش آمده"); 
    }
        
});


// router.get("/getWaOprator" , async (req , res , next)=>{
//         try{
//             const result =await opratorModel.findOne({_id:req.query.opratorId});
//             res.status(200).send(result);  
//         }catch(err){
//             res.status(500).send("مشکلی پیش آمده");
//         }
// });


router.post("/updateWaOpratorEn", verify , async (req , res , next)=>{
    try{
        const result =await waOpratorMEn.updateOne({_id:req.body.id} , {'$set': {
             'firstName' : req.body.firstName,
             'lastName':req.body.lastName,
            'phoneNumber': req.body.phoneNumber,
        }});
        res.status(200).send(result);  
    }catch(err){
        res.status(500).send("مشکلی پیش آمده");
    }
});

//delete category
router.post("/deleteWaOpratorEn", verify , async (req , res , next)=>{
    if(req.body.opratorId){
        try{
           await waOpratorMEn.findOneAndUpdate({_id:req.body.opratorId} , {deleteDate:Date.now()});
           const length =await waOpratorMEn.countDocuments({deleteDate:null});
            res.status(200).send({msg:"اپراتور حذف شد" , ln:length});
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، اپراتور حذف نشد");
        }
    }
});


//------------************ main web api ************------------
router.post('/newCallRequestMainEn' , async (req , res ) =>{
    try{
        await opratorMEn.updateOne({_id:req.body.targetId} , {$push:{contactRequest:{phoneNumber:req.body.phoneNumber  , called:false}}});
        res.status(200).send('درخواست ثبت شد');
    }catch{
        res.status(401).send('خطا!مشکلی پیش آمده');
    }
})

module.exports = router;     

