const express = require('express');
const mongoose = require("mongoose");
const tagModel = require("../../models/tagModel");
const categoryModel = require("../../models/categoryModel");
const userModel = require("../../models/userModel");
const dbConnection = require('../../connections/fa_connection');
const dbConnection2 = require('../../connections/ar_connection');
const dbConnection3 = require('../../connections/en_connection');

const verify = require("../users/verifyToken");
const { json } = require('body-parser');
const router = express.Router()


const user = dbConnection.model("user" ,userModel);
const category = dbConnection.model("category" ,categoryModel );
const tag = dbConnection.model("tag" ,tagModel );


const categoryAr = dbConnection2.model("category" ,categoryModel );
const tagAr = dbConnection2.model("tag" ,tagModel );


const categoryEn = dbConnection3.model("category" ,categoryModel );
const tagEn = dbConnection3.model("tag" ,tagModel );
// router.post("/" , async (req , res , next)=>{
//     // const recivedTag = req.body.tagData;
//     if(req.body.tagData){
//         var newTag = new tagModel({
//             tag:req.body.tagData
//         })

//         try{
//             const result = await newTag.save();
//             res.status(200).send(result);
//         }catch(error){
//              res.status(403).send("تگ تکراری است");

//         }
//     }
//     if(req.body.key){
//         console.log(req.body.key);

//         try{
//            const response = await tagModel.deleteOne({_id:req.body.key});
//            const data = await response;
//            res.send(data);
//            console.log(response);
//         }catch(error){
//              res.status(403).send("خطایی رخ داده است!");

//         }
//     }

// });

//get all category

router.get("/getAllCategories", verify ,async(req , res)=>{
    var length;
    var result;
    try{
        if(req.query.language === 'persian'){
             length = await category.countDocuments({deleteDate:null});
             result = await category.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }else if(req.query.language === 'arabic'){
            length = await categoryAr.countDocuments({deleteDate:null});
            result = await categoryAr.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }else if(req.query.language === 'english'){
            length = await categoryEn.countDocuments({deleteDate:null});
            result = await categoryEn.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }
        var authorIds =[];
        var tempArr  = [];
        var finalArr  = [];
        for(var i = 0 ; result.length > i ; i++){
            authorIds.push(result[i].author);
        }
        const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
        for(var i = 0 ; result.length > i ; i++){
            for(var j = 0 ; rs2.length > j ; j++){
                
                if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                    tempArr.push({category:result[i] , author:rs2[j]});
                }
            }
        }
        finalArr = tempArr.reverse();
        res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
    }catch(err){
        console.log(err)
           res.status(500).send("مشکلی رخ داده است");
    }

});
//get all tags
router.get("/getAllTagsForMultiSelect", verify , (req , res)=>{
    var newArrayToSend = [];
    try{
        if(req.query.language === 'persian'){
            tag.find({deleteDate:null},(err,data)=>{
                for(var i=0 ; data.length > i ; i++){
                    if(data[i].categoriesId.includes(req.query.params) === false){
                        newArrayToSend.push(data[i]);
                    }
                }
                res.status(200).send(newArrayToSend);
            })
        }else if(req.query.language === 'arabic'){
            tagAr.find({deleteDate:null},(err,data)=>{
                for(var i=0 ; data.length > i ; i++){
                    if(data[i].categoriesId.includes(req.query.params) === false){
                        newArrayToSend.push(data[i]);
                    }
                }
                res.status(200).send(newArrayToSend);
            })
        }else if(req.query.language === 'english'){
            tagEn.find({deleteDate:null},(err,data)=>{
                for(var i=0 ; data.length > i ; i++){
                    if(data[i].categoriesId.includes(req.query.params) === false){
                        newArrayToSend.push(data[i]);
                    }
                }
                res.status(200).send(newArrayToSend);
            })
        }
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});


//new category
router.post("/newCategory", verify , async (req , res , next)=>{
    var newCategory;
    if(req.body.categoryData){
        if(req.body.language === 'persian'){
                newCategory = new category({
                author:req.body.author,
                category:req.body.categoryData      
            })
        }else if(req.body.language === 'arabic'){
                newCategory = new categoryAr({
                author:req.body.author,
                category:req.body.categoryData      
            })
        }else if(req.body.language === 'english'){
                newCategory = new categoryEn({
                author:req.body.author,
                category:req.body.categoryData      
            })
        }
        try{
            const result = await newCategory.save();
            res.status(200).send({msg:'دسته بندی جدید اضافه شد' , result:result});
        }catch(error){
             res.status(403).send("دسته بندی تکراری است");
        }
    }
});

//delete category
router.post("/deleteCategory", verify , async (req , res , next)=>{
    if(req.body.categoryId){
        try{
            if(req.body.language === 'persian'){
                await category.findOneAndUpdate({_id:req.body.categoryId} , {deleteDate:Date.now()});
            }else if(req.body.language === 'arabic'){
                await categoryAr.findOneAndUpdate({_id:req.body.categoryId} , {deleteDate:Date.now()});
            }else if(req.body.language === 'english'){
                await categoryEn.findOneAndUpdate({_id:req.body.categoryId} , {deleteDate:Date.now()});
            }
            res.status(200).send("دسته بندی حذف شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، دسته بندی حذف نشد");
        }
    }
});



router.post("/newTag", verify , async (req , res , next)=>{
    var newTag;
    if(req.body.categoryId){
        try{   
           if(await tag.findOne({tag:req.body.tag})){
               res.status(403).send("تگ تکراری است");
           }else{
                if(req.body.language === 'persian'){
                    newTag = new tag({
                        author:req.body.author,
                        tag:req.body.tag,
                        categoriesId:req.body.categoryId,
                        validation:[{categoryId:req.body.categoryId , validationStatus:false}]
                    })
                }else if(req.body.language === 'arabic'){
                    newTag = new tagAr({
                        author:req.body.author,
                        tag:req.body.tag,
                        categoriesId:req.body.categoryId,
                        validation:[{categoryId:req.body.categoryId , validationStatus:false}]
                    })
                }else if(req.body.language === 'english'){
                    newTag = new tagEn({
                        author:req.body.author,
                        tag:req.body.tag,
                        categoriesId:req.body.categoryId,
                        validation:[{categoryId:req.body.categoryId , validationStatus:false}]
                    })
                }
                const newTagResult = await newTag.save();
               const categoryUpdateResult =await category.findOneAndUpdate({_id:req.body.categoryId} , {$push:{tagsId:newTagResult._id}});
               res.status(200).send(JSON.stringify({tagResult:newTagResult , categoryResult:categoryUpdateResult , msg:"تگ اضاف شد"}));
           }
        }catch(error){
            console.log(error);
            res.status(403).send("خطا!تگ اضاف جدید ایجاد نشد");
        }

    }else{
        res.status(403).send("دسته بندی را انتخاب نکردید");

    }
});


router.post("/addTagToCategory", verify , async (req , res , next)=>{
    var categoryRes;
    var tagResponse;
    if(req.body.categoryId){
      try{
        if(req.body.language === 'persian'){
            categoryRes = await category.findOneAndUpdate({_id:req.body.categoryId} ,  {$push:{tagsId:req.body.tags}});
            tagResponse = await tag.updateMany( { _id: { $in: req.body.tags } },
            { $push: { categoriesId : req.body.categoryId , validation:{categoryId:req.body.categoryId  , validationStatus:false} } },
            {multi: true})
        }else if(req.body.language === 'arabic'){
            categoryRes = await categoryAr.findOneAndUpdate({_id:req.body.categoryId} ,  {$push:{tagsId:req.body.tags}});
            tagResponse = await tagAr.updateMany( { _id: { $in: req.body.tags } },
            { $push: { categoriesId : req.body.categoryId , validation:{categoryId:req.body.categoryId  , validationStatus:false} } },
            {multi: true})
        }else if(req.body.language === 'english'){
            categoryRes = await categoryEn.findOneAndUpdate({_id:req.body.categoryId} ,  {$push:{tagsId:req.body.tags}});
            tagResponse = await tagEn.updateMany( { _id: { $in: req.body.tags } },
            { $push: { categoriesId : req.body.categoryId , validation:{categoryId:req.body.categoryId  , validationStatus:false} } },
            {multi: true})
        }
         res.status(200).send(JSON.stringify({tagResult:tagResponse , categoryResult:categoryRes , msg:"دسته بندی بروز شد"}));
      }catch{
        res.status(403).send("خطا!دسته بندی بروزرسانی نشد");

      }

    }else{
        res.status(403).send("دسته بندی را انتخاب نکردید");

    }
});


router.post("/updateCategory", verify , async (req , res , next)=>{
    var result;
    try{
        if(req.body.language === 'persian'){
                result =await category.updateOne({_id:req.body.id} ,{'$set': {
                category:req.body.value,
                 updateDate:Date.now()
           }});
        }else if(req.body.language === 'arabic'){
                result =await categoryAr.updateOne({_id:req.body.id} ,{'$set': {
                category:req.body.value,
                 updateDate:Date.now()
           }});
        }else if(req.body.language === 'english'){
                result =await categoryEn.updateOne({_id:req.body.id} ,{'$set': {
                category:req.body.value,
                 updateDate:Date.now()
           }});
        }
        res.status(200).send(result);  
    }catch(err){
        res.status(500).send("عملیات انجام نشد!");
    }
});



router.post("/searchInCategory", verify , async (req , res , next)=>{
    // var regex = new RegExp(req.body.searching, "i");
    var searched;
    if(req.body.searching){
        try{
            if(req.body.language === 'persian'){
                    searched = await category.find({
                    deleteDate:null,
                    "category" :   { "$regex": req.body.searching, "$options":"i"}
                }).limit(parseInt(20));
            }else if(req.body.language === 'arabic'){
                    searched = await categoryAr.find({
                    deleteDate:null,
                    "category" :   { "$regex": req.body.searching, "$options":"i"}
                }).limit(parseInt(20));
            }else if(req.body.language === 'english'){
                    searched = await categoryEn.find({
                    deleteDate:null,
                    "category" :   { "$regex": req.body.searching, "$options":"i"}
                }).limit(parseInt(20));
            }
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; searched.length > i ; i++){
                authorIds.push(searched[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
            for(var i = 0 ; searched.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    if(JSON.stringify(searched[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({category:searched[i] , author:rs2[j]});
                    }
                }
            }
            res.status(200).send(JSON.stringify(finalArr)); 
        }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }else{
        res.status(200).send([]);
    }
});


router.post("/validationUpdate", verify , async (req , res , next)=>{
    var response;
    if(await category.findOne({_id:req.body.id , validation:true}).exec()){
        try{
            if(req.body.language === 'persian'){
                response = await category.updateOne({_id:req.body.id} , {validation:false});
            }else if(req.body.language === 'arabic'){
                response = await categoryAr.updateOne({_id:req.body.id} , {validation:false});
            }else if(req.body.language === 'english'){
                response = await categoryEn.updateOne({_id:req.body.id} , {validation:false});
            }
            const data = response;
            res.send(data);
            
         }catch(error){
              res.status(403).send("خطایی رخ داده است!");
     
         }
    }else{
        try{
            if(req.body.language === 'persian'){
                response = await category.updateOne({_id:req.body.id} , {validation:true});
            }else if(req.body.language === 'arabic'){
                response = await categoryAr.updateOne({_id:req.body.id} , {validation:true});
            }else if(req.body.language === 'english'){
                response = await categoryEn.updateOne({_id:req.body.id} , {validation:true});
            }
            const data = response;
            res.send(data);
         }catch(error){
              res.status(403).send("خطایی رخ داده است!");
         }
    }
    
});


//delete category
router.post("/deleteTag", verify , async (req , res , next)=>{

    if(req.body.tagId){
        const check = await tag.findOne({_id:req.body.tagId});
        if(check.categoriesId.length===1){
            try{
                if(req.body.language === 'persian'){
                    await tag.findOneAndUpdate({_id:req.body.tagId} ,{ deleteDate:Date.now() , $pull: {
                        categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
                    }}, {useFindAndModify: false});
                }else if(req.body.language === 'arabic'){
                    await tagAr.findOneAndUpdate({_id:req.body.tagId} ,{ deleteDate:Date.now() , $pull: {
                        categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
                    }}, {useFindAndModify: false});
                }else if(req.body.language === 'english'){
                    await tagEn.findOneAndUpdate({_id:req.body.tagId} ,{ deleteDate:Date.now() , $pull: {
                        categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
                    }}, {useFindAndModify: false});
                }
                 res.status(200).send("تگ حذف شد");
             }catch(error){
                  res.status(403).send("مشکلی پیش آمده، تگ حذف نشد");
                  console.log(error);
             }
        }else if(check.categoriesId.length>1){
            try{
                if(req.body.language === 'persian'){
                    await tag.findOneAndUpdate({_id:req.body.tagId} ,{ $pull: {
                        categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
                    }}, {useFindAndModify: false});
                }else if(req.body.language === 'arabic'){
                    await tagAr.findOneAndUpdate({_id:req.body.tagId} ,{ $pull: {
                        categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
                    }}, {useFindAndModify: false});
    
                }else if(req.body.language === 'english'){
                    await tagEn.findOneAndUpdate({_id:req.body.tagId} ,{ $pull: {
                        categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
                    }}, {useFindAndModify: false});
                }
                 res.status(200).send("تگ حذف شد");
             }catch(error){
                  res.status(403).send("مشکلی پیش آمده، تگ حذف نشد");
                  console.log(error);

             }
        }
    }
});



//get all tags for list
router.get("/getAllTagsForList", verify ,async(req , res)=>{
    const tempArr = [];
    var finalArr  = [];
    var length;
    var result;
    var rs2;
    try{
        if(req.query.language === 'persian'){
             length = await tag.countDocuments({deleteDate:null});
             result = await tag.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }else if(req.query.language === 'arabic'){
             length = await tagAr.countDocuments({deleteDate:null});
             result = await tagAr.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }else if(req.query.language === 'english'){
             length = await tagEn.countDocuments({deleteDate:null});
             result = await tagEn.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }

        for(var i = 0 ; result.length>i ; i++){
            if(req.query.language === 'persian'){
                rs2 = await category.find({deleteDate:null}).where('_id').in(result[i].categoriesId);
            }else if(req.query.language === 'arabic'){
                rs2 = await categoryAr.find({deleteDate:null}).where('_id').in(result[i].categoriesId);
            }else if(req.query.language === 'english'){
                rs2 = await categoryEn.find({deleteDate:null}).where('_id').in(result[i].categoriesId);
            }
          const authors = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(result[i].author);   
          for(var j = 0 ; rs2.length > j ; j++){
            tempArr.push({tag:result[i] , author:authors[0] , category:rs2[j] });
          }
        }
        finalArr = tempArr.reverse();
        res.status(200).send(JSON.stringify({ln:length , rs:finalArr}));
    }catch(err){
        res.status(500).send("مشکلی رخ داده است");
    }
});


router.post("/tagValidation", verify , async (req , res , next)=>{
    
    var tagDbEndpoint;
    if(req.body.language === 'persian'){
        tagDbEndpoint = tag;
    }else if(req.body.language === 'arabic'){
        tagDbEndpoint = tagAr;
    }else if(req.body.language === 'english'){
        tagDbEndpoint = tagEn;
    } 
    const check = await tagDbEndpoint.findOne({_id:req.body.id.tagId});
    for(var i = 0 ; check.validation.length > i ; i++){
        if(check.validation[i].categoryId === req.body.id.categoryId && check.validation[i].validationStatus === false ){
                try{
                    var response = await tagDbEndpoint.updateOne({_id:req.body.id.tagId , 'validation.categoryId': req.body.id.categoryId} , {'$set': {
                        'validation.$.validationStatus': true
                    }});        
                    const data = response;
                    res.send(data); 
                }catch(error){
                    res.status(403).send("خطایی رخ داده است!");
                    console.log(error)
                }
        }else if(check.validation[i].categoryId === req.body.id.categoryId && check.validation[i].validationStatus === true){
                     try{
                        var response = await tagDbEndpoint.updateOne({_id:req.body.id.tagId , 'validation.categoryId': req.body.id.categoryId} , {'$set': {
                            'validation.$.validationStatus': false
                        }})
                        const data = response;
                        res.send(data);
                    }catch(error){
                        res.status(403).send("خطایی رخ داده است!");
                
                    }
        }
    }

    
});

router.post("/searchInTags", verify , async (req , res , next)=>{
    // var regex = new RegExp(req.body.searching, "i");
    var arrayToSend = [];
    var searched;
    var rs2;
    if(req.body.searching){
        
        try{
            if(req.body.language === 'persian'){
                    searched = await tag.find({
                    deleteDate:null,
                    "tag" :   { "$regex": req.body.searching, "$options":"i"}
                }).limit(parseInt(20));
            }else if(req.body.language === 'arabic'){
                     searched = await tagAr.find({
                    deleteDate:null,
                    "tag" :   { "$regex": req.body.searching, "$options":"i"}
                }).limit(parseInt(20));
            }else if(req.body.language === 'english'){
                     searched = await tagEn.find({
                    deleteDate:null,
                    "tag" :   { "$regex": req.body.searching, "$options":"i"}
                }).limit(parseInt(20));
            }
            for(var i = 0 ; searched.length>i ; i++){
                if(req.body.language === 'persian'){
                         rs2 = await category.find({deleteDate:null}).where('_id').in(searched[i].categoriesId);
                }else if(req.body.language === 'arabic'){
                         rs2 = await categoryAr.find({deleteDate:null}).where('_id').in(searched[i].categoriesId);
                }else if(req.body.language === 'english'){
                         rs2 = await categoryEn.find({deleteDate:null}).where('_id').in(searched[i].categoriesId);
                }
                const authors = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(searched[i].author);   
                for(var j = 0 ; rs2.length > j ; j++){
                  arrayToSend.push({tag:searched[i] , author:authors[0] , category:rs2[j] });
                }
              }
              
              res.status(200).send(JSON.stringify({rs:arrayToSend})); 
        }catch(err){
            res.status(500).send("مشکلی پیش آمده");
        }
    }else{
        res.status(200).send([]);
    }
});


router.post("/updateTag", verify , async (req , res , next)=>{
    var result;
    try{
        if(req.body.language === 'persian'){
                 result =await tag.updateOne({_id:req.body.id} ,{'$set': {
                tag:req.body.value,
                updateDate:Date.now()
            }});

        }else if(req.body.language === 'arabic'){
                 result =await tagAr.updateOne({_id:req.body.id} ,{'$set': {
                tag:req.body.value,
                updateDate:Date.now()
            }});

        }else if(req.body.language === 'english'){
                 result =await tagEn.updateOne({_id:req.body.id} ,{'$set': {
                tag:req.body.value,
                updateDate:Date.now()
            }});
        }
        res.status(200).send(result);  
    }catch(err){
 
        res.status(500).send("عملیات انجام نشد!");
    }
});



//------------************ main web api ************------------
router.get("/getAllCategoriesWithTagsForMainPage" ,async(req , res)=>{
    let arrayToSend = [];
    var result;
    var rs2;
    try{
        if(req.query.language === 'persian'){
            result = await category.find({deleteDate:null , validation:true});
            for(var i = 0 ; result.length>i ; i++){
                rs2 = await tag.find({deleteDate:null}).where('_id').in(result[i].tagsId);
                arrayToSend.push({category:result[i] , tags:rs2 });
            }
        }else if(req.query.language === 'arabic'){
            result = await categoryAr.find({deleteDate:null , validation:true});
            for(var i = 0 ; result.length>i ; i++){
                rs2 = await tagAr.find({deleteDate:null}).where('_id').in(result[i].tagsId);
                arrayToSend.push({category:result[i] , tags:rs2 });
            }
        }else if(req.query.language === 'english'){
            result = await categoryEn.find({deleteDate:null , validation:true});
            for(var i = 0 ; result.length>i ; i++){
                rs2 = await tagEn.find({deleteDate:null}).where('_id').in(result[i].tagsId);
                arrayToSend.push({category:result[i] , tags:rs2 });
            }
        }
        res.status(200).send(JSON.stringify({rs:arrayToSend}));
    }catch(err){
        console.log(err)
        res.status(500).send("مشکلی رخ داده است");
    }
});



module.exports = router;    
