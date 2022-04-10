const express = require('express');
const mongoose = require("mongoose");
const tagModel = require("../../models/tagModel");
const categoryModel = require("../../models/categoryModel");
const userModel = require("../../models/userModel");
const dbConnection = require('../../connections/fa_connection');
const dbConnection2 = require('../../connections/ar_connection');
const verify = require("../users/verifyToken");
const { json } = require('body-parser');
const router = express.Router()


const user = dbConnection.model("user" ,userModel);
const category = dbConnection.model("category" ,categoryModel );
const tag = dbConnection.model("tag" ,tagModel );

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
    try{
        const length = await category.countDocuments({deleteDate:null});
        const result = await category.find({deleteDate:null}).limit(parseInt(req.query.limit));
        var authorIds =[];
        var finalArr  = [];
        for(var i = 0 ; result.length > i ; i++){
            authorIds.push(result[i].author);
        }
        const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
        for(var i = 0 ; result.length > i ; i++){
            for(var j = 0 ; rs2.length > j ; j++){
                
                if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                    finalArr.push({category:result[i] , author:rs2[j]});
                }
            }
        }
        res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});
//get all tags
router.get("/getAllTagsForMultiSelect", verify , (req , res)=>{
    var newArrayToSend = [];
    try{
        tag.find({deleteDate:null},(err,data)=>{
            for(var i=0 ; data.length > i ; i++){
                if(data[i].categoriesId.includes(req.query.params) === false){
                    newArrayToSend.push(data[i]);
                }
            }
            res.status(200).send(newArrayToSend);
        })
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});


//new category
router.post("/newCategory", verify , async (req , res , next)=>{
    if(req.body.categoryData){
        var newCategory = new category({
            author:req.body.author,
            category:req.body.categoryData      
        })
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
           await category.findOneAndUpdate({_id:req.body.categoryId} , {deleteDate:Date.now()});
            res.status(200).send("دسته بندی حذف شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، دسته بندی حذف نشد");
        }
    }
});



router.post("/newTag", verify , async (req , res , next)=>{
    if(req.body.categoryId){
        try{   
           if(await tag.findOne({tag:req.body.tag})){
               res.status(403).send("تگ تکراری است");
           }else{
                var newTag = new tag({
                    author:req.body.author,
                    tag:req.body.tag,
                    categoriesId:req.body.categoryId,
                    validation:[{categoryId:req.body.categoryId , validationStatus:false}]
                })
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
    if(req.body.categoryId){
      try{
         const categoryRes = await category.findOneAndUpdate({_id:req.body.categoryId} ,  {$push:{tagsId:req.body.tags}});
         const tagResponse = await tag.updateMany( { _id: { $in: req.body.tags } },
         { $push: { categoriesId : req.body.categoryId , validation:{categoryId:req.body.categoryId  , validationStatus:false} } },
         {multi: true})
         res.status(200).send(JSON.stringify({tagResult:tagResponse , categoryResult:categoryRes , msg:"دسته بندی بروز شد"}));

      }catch{
        res.status(403).send("خطا!دسته بندی بروزرسانی نشد");

      }

    }else{
        res.status(403).send("دسته بندی را انتخاب نکردید");

    }
});


router.post("/updateCategory", verify , async (req , res , next)=>{
    try{
        const result =await category.updateOne({_id:req.body.id} ,{'$set': {
            category:req.body.value,
             updateDate:Date.now()
       }});
        res.status(200).send(result);  
    }catch(err){
 
        res.status(500).send("عملیات انجام نشد!");
    }
});



router.post("/searchInCategory", verify , async (req , res , next)=>{
    // var regex = new RegExp(req.body.searching, "i");
    if(req.body.searching){
        try{
            const searched = await category.find({
                deleteDate:null,
                "category" :   { "$regex": req.body.searching, "$options":"i"}
            }).limit(parseInt(20));
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

    if(await category.findOne({_id:req.body.id , validation:true}).exec()){
        try{
            const response = await category.updateOne({_id:req.body.id} , {validation:false});
            const data = response;
            res.send(data);
            
         }catch(error){
              res.status(403).send("خطایی رخ داده است!");
     
         }
    }else{
        try{
            const response = await category.updateOne({_id:req.body.id} , {validation:true});
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
                await tag.findOneAndUpdate({_id:req.body.tagId} ,{ deleteDate:Date.now() , $pull: {
                 categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
             }}, {useFindAndModify: false});
                 res.status(200).send("تگ حذف شد");
             }catch(error){
                  res.status(403).send("مشکلی پیش آمده، تگ حذف نشد");
                  console.log(error);
             }
        }else if(check.categoriesId.length>1){
            try{
                await tag.findOneAndUpdate({_id:req.body.tagId} ,{ $pull: {
                 categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
             }}, {useFindAndModify: false});
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
    const arrayToSend = [];
    try{
        const length = await tag.countDocuments({deleteDate:null});
        const result = await tag.find({deleteDate:null}).limit(parseInt(req.query.limit));
        for(var i = 0 ; result.length>i ; i++){
          const rs2 = await category.find({deleteDate:null}).where('_id').in(result[i].categoriesId);
          for(var j = 0 ; rs2.length > j ; j++){
            arrayToSend.push({tag:result[i] , category:rs2[j] });
          }
        }
        res.status(200).send(JSON.stringify({ln:length , rs:arrayToSend}));
    }catch(err){
        res.status(500).send("مشکلی رخ داده است");
    }

});


router.post("/tagValidation", verify , async (req , res , next)=>{
    // console.log(req.body.tagId);
    var check = await tag.findOne({_id:req.body.tagId});
    for(var i = 0 ; check.validation.length > i ; i++){
        if(check.validation[i].categoryId === req.body.categoryId && check.validation[i].validationStatus === false ){
            
                try{
                    const response = await tag.updateOne({_id:req.body.tagId , 'validation.categoryId': req.body.categoryId} , {'$set': {
                        'validation.$.validationStatus': true
                    }});           
                        const data = response;
                    res.send(data);
                
                }catch(error){
                    res.status(403).send("خطایی رخ داده است!");

                    console.log(error)
                }
        }else if(check.validation[i].categoryId === req.body.categoryId && check.validation[i].validationStatus === true){
                
                     try{
                        const response = await tag.updateOne({_id:req.body.tagId , 'validation.categoryId': req.body.categoryId} , {'$set': {
                            'validation.$.validationStatus': false
                        }});
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
    if(req.body.searching){
        try{
            const searched = await tag.find({
                deleteDate:null,
                "tag" :   { "$regex": req.body.searching, "$options":"i"}
            }).limit(parseInt(20));
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; searched.length > i ; i++){
                authorIds.push(searched[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
            for(var i = 0 ; searched.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    
                    if(JSON.stringify(searched[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({tags:searched[i] , author:rs2[j]});
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


router.post("/updateTag", verify , async (req , res , next)=>{
    try{
        const result =await tag.updateOne({_id:req.body.id} ,{'$set': {
            tag:req.body.value,
             updateDate:Date.now()
       }});
        res.status(200).send(result);  
    }catch(err){
 
        res.status(500).send("عملیات انجام نشد!");
    }
});




//------------************ main web api ************------------
router.get("/getAllCategoriesWithTagsForMainPage" ,async(req , res)=>{
    let arrayToSend = [];
    try{
        const result = await category.find({deleteDate:null , validation:true});
        for(var i = 0 ; result.length>i ; i++){
          const rs2 = await tag.find({deleteDate:null}).where('_id').in(result[i].tagsId);
            arrayToSend.push({category:result[i] , tags:rs2 });
        }
        res.status(200).send(JSON.stringify({rs:arrayToSend}));
    }catch(err){
        console.log(err)
        res.status(500).send("مشکلی رخ داده است");
    }
});


//---------------------------------------------------------------Arabic---------------------------------------------------------

const userAr = dbConnection2.model("user" ,userModel);
const categoryAr = dbConnection2.model("category" ,categoryModel );
const tagAr = dbConnection2.model("tag" ,tagModel );

router.get("/getAllCategoriesAr", verify ,async(req , res)=>{
    try{
        const length = await categoryAr.countDocuments({deleteDate:null});
        const result = await categoryAr.find({deleteDate:null}).limit(parseInt(req.query.limit));
        var authorIds =[];
        var finalArr  = [];
        for(var i = 0 ; result.length > i ; i++){
            authorIds.push(result[i].author);
        }
        const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
        for(var i = 0 ; result.length > i ; i++){
            for(var j = 0 ; rs2.length > j ; j++){
                
                if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                    finalArr.push({category:result[i] , author:rs2[j]});
                }
            }
        }
        res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});
//get all tags
router.get("/getAllTagsForMultiSelectAr", verify , (req , res)=>{
    var newArrayToSend = [];
    try{
        tagAr.find({deleteDate:null},(err,data)=>{
            for(var i=0 ; data.length > i ; i++){
                if(data[i].categoriesId.includes(req.query.params) === false){
                    newArrayToSend.push(data[i]);
                }
            }
            res.status(200).send(newArrayToSend);
        })
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});


//new category
router.post("/newCategoryAr", verify , async (req , res , next)=>{
    if(req.body.categoryData){
        var newCategory = new categoryAr({
            author:req.body.author,
            category:req.body.categoryData      
        })
        try{
            const result = await newCategory.save();
            res.status(200).send({msg:'دسته بندی جدید اضافه شد' , result:result});
        }catch(error){
             res.status(403).send("دسته بندی تکراری است");
        }
    }
});

//delete category
router.post("/deleteCategoryAr", verify , async (req , res , next)=>{
    if(req.body.categoryId){
        try{
           await categoryAr.findOneAndUpdate({_id:req.body.categoryId} , {deleteDate:Date.now()});
            res.status(200).send("دسته بندی حذف شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، دسته بندی حذف نشد");
        }
    }
});



router.post("/newTagAr", verify , async (req , res , next)=>{
    if(req.body.categoryId){
        try{   
           if(await tag.findOne({tag:req.body.tag})){
               res.status(403).send("تگ تکراری است");
           }else{
                var newTag = new tagAr({
                    author:req.body.author,
                    tag:req.body.tag,
                    categoriesId:req.body.categoryId,
                    validation:[{categoryId:req.body.categoryId , validationStatus:false}]
                })
                const newTagResult = await newTag.save();
               const categoryUpdateResult =await categoryAr.findOneAndUpdate({_id:req.body.categoryId} , {$push:{tagsId:newTagResult._id}});
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


router.post("/addTagToCategoryAr", verify , async (req , res , next)=>{
    if(req.body.categoryId){
      try{
         const categoryRes = await categoryAr.findOneAndUpdate({_id:req.body.categoryId} ,  {$push:{tagsId:req.body.tags}});
         const tagResponse = await tagAr.updateMany(   { _id: { $in: req.body.tags } },
         { $push: { categoriesId : req.body.categoryId , validation:{categoryId:req.body.categoryId  , validationStatus:false} } },
         {multi: true})
         res.status(200).send(JSON.stringify({tagResult:tagResponse , categoryResult:categoryRes , msg:"دسته بندی بروز شد"}));

      }catch{
        res.status(403).send("خطا!دسته بندی بروزرسانی نشد");

      }

    }else{
        res.status(403).send("دسته بندی را انتخاب نکردید");

    }
});


router.post("/updateCategoryAr", verify , async (req , res , next)=>{
    try{
        const result =await categoryAr.updateOne({_id:req.body.id} ,{'$set': {
            category:req.body.value,
             updateDate:Date.now()
       }});
        res.status(200).send(result);  
    }catch(err){
 
        res.status(500).send("عملیات انجام نشد!");
    }
});



router.post("/searchInCategoryAr", verify , async (req , res , next)=>{
    // var regex = new RegExp(req.body.searching, "i");
    if(req.body.searching){
        try{
            const searched = await categoryAr.find({
                deleteDate:null,
                "category" :   { "$regex": req.body.searching, "$options":"i"}
            }).limit(parseInt(20));
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


router.post("/validationUpdateAr", verify , async (req , res , next)=>{

    if(await categoryAr.findOne({_id:req.body.id , validation:true}).exec()){
        try{
            const response = await categoryAr.updateOne({_id:req.body.id} , {validation:false});
            const data = response;
            res.send(data);
            
         }catch(error){
              res.status(403).send("خطایی رخ داده است!");
     
         }
    }else{
        try{
            const response = await categoryAr.updateOne({_id:req.body.id} , {validation:true});
            const data = response;
            res.send(data);
            
         }catch(error){
              res.status(403).send("خطایی رخ داده است!");
     
         }
    }
    
});


//delete category
router.post("/deleteTagAr", verify , async (req , res , next)=>{

    if(req.body.tagId){
        const check = await tagAr.findOne({_id:req.body.tagId});
        if(check.categoriesId.length===1){
            try{
                await tagAr.findOneAndUpdate({_id:req.body.tagId} ,{ deleteDate:Date.now() , $pull: {
                 categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
             }}, {useFindAndModify: false});
                 res.status(200).send("تگ حذف شد");
             }catch(error){
                  res.status(403).send("مشکلی پیش آمده، تگ حذف نشد");
                  console.log(error);
             }
        }else if(check.categoriesId.length>1){
            try{
                await tagAr.findOneAndUpdate({_id:req.body.tagId} ,{ $pull: {
                 categoriesId: req.body.categoryId,validation:{categoryId:req.body.categoryId}
             }}, {useFindAndModify: false});
                 res.status(200).send("تگ حذف شد");
             }catch(error){
                  res.status(403).send("مشکلی پیش آمده، تگ حذف نشد");
                  console.log(error);

             }
        }
    }
});



//get all tags for list
router.get("/getAllTagsForListAr", verify ,async(req , res)=>{
    const arrayToSend = [];
    try{
        const length = await tagAr.countDocuments({deleteDate:null});
        const result = await tagAr.find({deleteDate:null}).limit(parseInt(req.query.limit));
        for(var i = 0 ; result.length>i ; i++){
          const rs2 = await categoryAr.find({deleteDate:null}).where('_id').in(result[i].categoriesId);
          for(var j = 0 ; rs2.length > j ; j++){
            arrayToSend.push({tag:result[i] , category:rs2[j] });
          }
        }
        res.status(200).send(JSON.stringify({ln:length , rs:arrayToSend}));
    }catch(err){
        res.status(500).send("مشکلی رخ داده است");
    }

});


router.post("/tagValidationAr", verify , async (req , res , next)=>{
    // console.log(req.body.tagId);
    var check = await tagAr.findOne({_id:req.body.tagId});
    for(var i = 0 ; check.validation.length > i ; i++){
        if(check.validation[i].categoryId === req.body.categoryId && check.validation[i].validationStatus === false ){
            
                try{
                    const response = await tagAr.updateOne({_id:req.body.tagId , 'validation.categoryId': req.body.categoryId} , {'$set': {
                        'validation.$.validationStatus': true
                    }});           
                        const data = response;
                    res.send(data);
                
                }catch(error){
                    res.status(403).send("خطایی رخ داده است!");

                    console.log(error)
                }
        }else if(check.validation[i].categoryId === req.body.categoryId && check.validation[i].validationStatus === true){
                
                     try{
                        const response = await tagAr.updateOne({_id:req.body.tagId , 'validation.categoryId': req.body.categoryId} , {'$set': {
                            'validation.$.validationStatus': false
                        }});
                        const data = response;
                        res.send(data);
                        
                    }catch(error){
                        res.status(403).send("خطایی رخ داده است!");
                
                    }
        }
    }

    
});

router.post("/searchInTagsAr", verify , async (req , res , next)=>{
    // var regex = new RegExp(req.body.searching, "i");
    if(req.body.searching){
        try{
            const searched = await tagAr.find({
                deleteDate:null,
                "tag" :   { "$regex": req.body.searching, "$options":"i"}
            }).limit(parseInt(20));
            var authorIds =[];
            var finalArr  = [];
            for(var i = 0 ; searched.length > i ; i++){
                authorIds.push(searched[i].author);
            }
            const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
            for(var i = 0 ; searched.length > i ; i++){
                for(var j = 0 ; rs2.length > j ; j++){
                    
                    if(JSON.stringify(searched[i].author) === JSON.stringify(rs2[j]._id)){
                        finalArr.push({tags:searched[i] , author:rs2[j]});
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


router.post("/updateTagAr", verify , async (req , res , next)=>{
    try{
        const result =await tagAr.updateOne({_id:req.body.id} ,{'$set': {
            tag:req.body.value,
             updateDate:Date.now()
       }});
        res.status(200).send(result);  
    }catch(err){
 
        res.status(500).send("عملیات انجام نشد!");
    }
});

module.exports = router;    
