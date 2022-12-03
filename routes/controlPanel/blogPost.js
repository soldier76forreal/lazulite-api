const express = require('express');
const mongoose = require("mongoose");
const tagModel = require("../../models/tagModel");
const categoryModel = require("../../models/categoryModel");
const verify = require("../users/verifyToken");
const productModel = require("../../models/productModel"); 
const {opratorModel} = require("../../models/opratorModel");
const {whatsAppOpratorModel} = require("../../models/opratorModel");
const featureListModel = require("../../models/featureListModel");
const userModel = require("../../models/userModel");

const { json } = require('body-parser');
const { findOneAndUpdate } = require('../../models/tagModel');
const router = express.Router()
const commentModel = require("../../models/commentModel");
const blogModel = require('../../models/blogModel');
const dbConnection = require('../../connections/fa_connection');
const dbConnection2 = require('../../connections/ar_connection');
const dbConnection3 = require('../../connections/en_connection');

const comment = dbConnection.model('comment' , commentModel);


const blog = dbConnection.model("blog" ,blogModel );
const blogAr = dbConnection2.model("blog" ,blogModel );
const blogEn = dbConnection3.model("blog" ,blogModel );
const user = dbConnection.model("user" ,userModel);



//get all category
// router.get("/getAllCategories", verify ,async (req , res)=>{
//     var response;
//     try{
//         if(req.query.language === 'persian'){
//             response =await category.find({deleteDate:null});
//         }else if(req.query.language === 'arabic'){
//             response =await categoryAr.find({deleteDate:null});
//         }else if(req.query.language === 'english'){
//             response =await categoryEn.find({deleteDate:null});
//         }
//         res.status(200).send(response);
//     }catch(err){
//            res.status(500).send("مشکلی رخ داده است");
//     }
// });
// router.get("/getAllTags", verify ,async (req , res)=>{
//     if(req.query.language === 'persian'){
//         tag.find().where('categoriesId').in(
//             req.query.categoriesId
//         ).exec((err, records) => {
//             if(err){
//                 res.status(500).send("مشکلی رخ داده است");
    
//             }else if(records){
//                 res.status(200).send(records);
//             }
//         });
//     }else if(req.query.language === 'arabic'){
//         tagAr.find().where('categoriesId').in(
//             req.query.categoriesId
//         ).exec((err, records) => {
//             if(err){
//                 res.status(500).send("مشکلی رخ داده است");
//             }else if(records){
//                 res.status(200).send(records);
//             }
//         });
//     }else if(req.query.language === 'english'){
//         tagEn.find().where('categoriesId').in(
//             req.query.categoriesId
//         ).exec((err, records) => {
//             if(err){
//                 res.status(500).send("مشکلی رخ داده است");
    
//             }else if(records){
//                 res.status(200).send(records);
//             }
//         });
//     }
// });

// router.get("/getAllOprator", verify ,async (req , res)=>{
//     var response;
//     try{
//         if(req.query.language === 'persian'){
//             response =await opratorM.find({deleteDate:null});
//         }else if(req.query.language === 'arabic'){
//             response =await opratorMAr.find({deleteDate:null});
//         }else if(req.query.language === 'english'){
//             response =await opratorMEn.find({deleteDate:null});
//         }
//         res.status(200).send(response);
//     }catch(err){
//            res.status(500).send("مشکلی رخ داده است");
//     }

// });

// router.get("/getAllWaOprator" , verify,async (req , res)=>{
//     var response;
//     try{
//         if(req.query.language === 'persian'){
//             response =await waOpratorM.find({deleteDate:null});
//         }else if(req.query.language === 'arabic'){
//             response =await waOpratorMAr.find({deleteDate:null});
//         }else if(req.query.language === 'english'){
//             response =await waOpratorMEn.find({deleteDate:null});
//         }
//         res.status(200).send(response);
//     }catch(err){
//            res.status(500).send("مشکلی رخ داده است");
//     }

// });
router.post("/validationBlogPost" , verify , async (req , res , next)=>{
    if(req.body.language === 'persian'){
        if(await blog.findOne({_id:req.body.id , validation:true}).exec()){
            try{
                const response = await blog.updateOne({_id:req.body.id} , {validation:false});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await blog.updateOne({_id:req.body.id} , {validation:true});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                  console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }

    }else if(req.body.language === 'arabic'){
        if(await blogAr.findOne({_id:req.body.id , validation:true}).exec()){
            try{
                const response = await blogAr.updateOne({_id:req.body.id} , {validation:false});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await blogAr.updateOne({_id:req.body.id} , {validation:true});
                const data = response;
                res.status(200).send(data);
                
             }catch(error){
                  console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }

    }else if(req.body.language === 'english'){
        if(await blogEn.findOne({_id:req.body.id , validation:true}).exec()){
            try{
                const response = await blogEn.updateOne({_id:req.body.id} , {validation:false});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await blogEn.updateOne({_id:req.body.id} , {validation:true});
                const data = response;
                res.status(200).send(data);
                
             }catch(error){
                  console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }

    }

});
router.post("/saveNewBlog" , verify , async (req , res)=>{
    var newBlogPost;
    if(req.body.language === 'persian'){
        newBlogPost = new blog({
            title:req.body.title,
            subtitle:req.body.subtitle,
            author:req.body.author,
            content:req.body.content,
            coverImage:req.body.coverImage,
            source:req.body.source,
            pageTitle:req.body.pageTitle,
            pageDescription:req.body.pageDescription
        })
    }else if(req.body.language === 'arabic'){
        newBlogPost = new blogAr({
            title:req.body.title,
            subtitle:req.body.subtitle,
            author:req.body.author,
            content:req.body.content,
            coverImage:req.body.coverImage,
            source:req.body.source,
            pageTitle:req.body.pageTitle,
            pageDescription:req.body.pageDescription
        })
    }else if(req.body.language === 'english'){
        newBlogPost = new blogEn({
            title:req.body.title,
            subtitle:req.body.subtitle,
            author:req.body.author,
            content:req.body.content,
            coverImage:req.body.coverImage,
            source:req.body.source,
            pageTitle:req.body.pageTitle,
            pageDescription:req.body.pageDescription
        })
    }
    try{
        const result = await newBlogPost.save();
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!پست   ذخیره نشد");
         console.log(error)
    }
});

//get all blog
router.get("/getAllBlog" , verify ,async(req , res)=>{
    var length;
    var result;
    try{
        if(req.query.language === 'persian'){
            length = await blog.countDocuments({deleteDate:null});
            result = await blog.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }else if(req.query.language === 'arabic'){
            length = await blogAr.countDocuments({deleteDate:null});
            result = await blogAr.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }else if(req.query.language === 'english'){
            length = await blogEn.countDocuments({deleteDate:null});
            result = await blogEn.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }
        var authorIds =[];
        var finalArr  = [];
        for(var i = 0 ; result.length > i ; i++){
            authorIds.push(result[i].author);
        }
        const rs2 = await user.find({deleteDate:null}).select('firstName , lastName , validation , role , insertDate , profileImage').where('_id').in(authorIds);
        for(var i = 0 ; result.length > i ; i++){
            for(var j = 0 ; rs2.length > j ; j++){
                
                if(JSON.stringify(result[i].author) === JSON.stringify(rs2[j]._id)){
                    finalArr.push({product:result[i] , author:rs2[j]});
                }
            }
        }
        
        res.status(200).send(JSON.stringify({ln:length , rs:finalArr})); 

    }catch(err){
        console.log(err);
           res.status(500).send("مشکلی رخ داده است");
    }
    
});
router.get("/getBlog" , verify,async (req , res)=>{
    var json = {}
    var response;

    try{  
        if(req.query.language === 'persian'){
            response = await blog.findOne({deleteDate:null , _id:req.query.id});
            tempRes = response;
        }else if(req.query.language === 'arabic'){
            response = await blogAr.findOne({deleteDate:null , _id:req.query.id});
            tempRes = response;
        }else if(req.query.language === 'english'){
            response = await blogEn.findOne({deleteDate:null , _id:req.query.id});
            tempRes = response;
        }
        json.product =response; 
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});


//delete Blog
router.post("/deleteBlog", verify , async (req , res , next)=>{
    if(req.body.blogId){
        try{
            if(req.body.language === 'persian'){
                await blog.findOneAndUpdate({_id:req.body.blogId} , {deleteDate:Date.now()});
            }else if(req.body.language === 'arabic'){
                await blogAr.findOneAndUpdate({_id:req.body.blogId} , {deleteDate:Date.now()});
            }else if(req.body.language === 'english'){
                await blogEn.findOneAndUpdate({_id:req.body.blogId} , {deleteDate:Date.now()});
            }
            res.status(200).send("بلاگ حذف شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، بلاگ حذف نشد");
        }
    }
});



router.get("/getTheBlog", verify ,async(req , res)=>{
    var result;
    try{
        if(req.query.language === 'persian'){
            result = await blog.findOne({deleteDate:null , _id:req.query.id});
        }else if(req.query.language === 'arabic'){
            result = await blogAr.findOne({deleteDate:null , _id:req.query.id});
        }else if(req.query.language === 'english'){
            result = await blogEn.findOne({deleteDate:null , _id:req.query.id});
        }
        res.status(200).send(result); 
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }
    
});

router.post("/updateBlog" , verify ,async (req , res)=>{
    var productDbConnection;
    if(req.body.language === 'persian'){
        productDbConnection = blog;
    }else if(req.body.language === 'arabic'){
        productDbConnection = blogAr;

    }else if(req.body.language === 'english'){
        productDbConnection = blogEn;
    }
    try{
        const result = await productDbConnection.findOneAndUpdate({_id:req.body.id} 
        , {
        title:req.body.title,
        subtitle:req.body.subtitle,
        coverImage:req.body.coverImage,
        content:req.body.content,
        pageTitle:req.body.pageTitle,
        pageDescription:req.body.pageDescription,
        updateDate:Date.now()
        });
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!بلاگ ویرایش نشد");
    }
});




// //feature Name
// router.post("/newFeatureList", verify , async (req , res , next)=>{
//     var newFeatureList;
//     if(req.body.language === 'persian'){
//         newFeatureList = new featureList({
//             listName:req.body.listName,
//             featureList:req.body.featureList,
//         })
//     }else if(req.body.language === 'arabic'){
//         newFeatureList = new featureListAr({
//             listName:req.body.listName,
//             featureList:req.body.featureList,
//         })
//     }else if(req.body.language === 'english'){
//         newFeatureList = new featureListEn({
//             listName:req.body.listName,
//             featureList:req.body.featureList,
//         })
//     }

//     try{
//         const result = await newFeatureList.save();
//         res.status(200).send(result);
//     }catch(error){
//          res.status(403).send("دسته بندی تکراری است");
//     }
// });


// router.get("/getAllFeatureList", verify ,async (req , res)=>{
//     var response;
//     try{
//         if(req.query.language === 'persian'){
//             response =await featureList.find({deleteDate:null});
//         }else if(req.query.language === 'arabic'){
//             response =await featureListAr.find({deleteDate:null});
//         }else if(req.query.language === 'english'){
//             response =await featureListEn.find({deleteDate:null});
//         }
//         res.status(200).send(response);
//     }catch(err){
//            res.status(500).send("مشکلی رخ داده است");
//     }

// });
// router.get("/getTheList", verify ,async (req , res)=>{
//     var response;
//     try{
//         if(req.query.language === 'persian'){
//              response =await featureList.findOne({deleteDate:null , _id:req.query.listId});
//         }else if(req.query.language === 'arabic'){
//              response =await featureListAr.findOne({deleteDate:null , _id:req.query.listId});
//         }else if(req.query.language === 'english'){
//              response =await featureListEn.findOne({deleteDate:null , _id:req.query.listId});

//         }
//         res.status(200).send(response);
//     }catch(err){
//            res.status(500).send("مشکلی رخ داده است");
//     }

// });



// router.get("/getProduct" , verify,async (req , res)=>{
//     var json = {}
//     var response;
//     var whatsAppContact;
//     var tempRes;
//     var phoneContact;
//     try{  
//         if(req.query.language === 'persian'){
//             response = await product.findOne({deleteDate:null , _id:req.query.id});
//             tempRes = response;
//             whatsAppContact =await waOpratorM.findOne({deleteDate:null , _id:response.contactButtons[0]});
//             phoneContact =await opratorM.findOne({deleteDate:null , _id:response.contactButtons[1]});
//         }else if(req.query.language === 'arabic'){
//             response = await productAr.findOne({deleteDate:null , _id:req.query.id});
//             tempRes = response;
//             whatsAppContact =await waOpratorMAr.findOne({deleteDate:null , _id:response.contactButtons[0]});
//             phoneContact =await opratorMAr.findOne({deleteDate:null , _id:response.contactButtons[1]});
//         }else if(req.query.language === 'english'){
//             response = await productEn.findOne({deleteDate:null , _id:req.query.id});
//             tempRes = response;
//             whatsAppContact =await waOpratorMEn.findOne({deleteDate:null , _id:response.contactButtons[0]});
//             phoneContact =await opratorMEn.findOne({deleteDate:null , _id:response.contactButtons[1]});
//         }
//         json.product =response; 
//         json.phoneContacts = [whatsAppContact,phoneContact];
//         res.status(200).send(json);
//     }catch(err){
//            res.status(500).send("مشکلی رخ داده است");
//            console.log(err);
//     }
// });

// //delete category
// router.post("/deleteFeatureList", verify, async (req , res , next)=>{
//     if(req.body.deleteTheListId){
//         try{
//             if(req.body.language === 'persian'){
//                 await featureList.findOneAndUpdate({_id:req.body.deleteTheListId} , {deleteDate:Date.now()});
//             }else if(req.body.language === 'arabic'){
//                 await featureListAr.findOneAndUpdate({_id:req.body.deleteTheListId} , {deleteDate:Date.now()});
//             }else if(req.body.language === 'english'){
//                 await featureListEn.findOneAndUpdate({_id:req.body.deleteTheListId} , {deleteDate:Date.now()});
//             }
//             res.status(200).send("لیست مورد نظر حذف شد");
//         }catch(error){
//              res.status(403).send("خطا!لیست حذف نشد");
//         }
//     }
// });


// router.post("/updateProduct" , verify ,async (req , res)=>{
//     var productDbConnection;
//     if(req.body.language === 'persian'){
//         productDbConnection = product;
//     }else if(req.body.language === 'arabic'){
//         productDbConnection = productAr;

//     }else if(req.body.language === 'english'){
//         productDbConnection = productEn;
//     }
//     try{
//         const result = await productDbConnection.findOneAndUpdate({_id:req.body.productIdToUpdate} 
//         , {title:req.body.title,
//         price:req.body.price,
//         contactButtons:req.body.contactBtn,
//         images:req.body.images,
//         categories:req.body.categories,
//         tags:req.body.tags,
//         features:req.body.featureList,
//         keyFeatures:req.body.keyFeatures,
//         productCode:req.body.productCode,
//         availableSurface:req.body.availableSurface,
//         pageTitle:req.body.pageTitle,
//         pageDescription:req.body.pageDescription,
//         updateDate:Date.now(),
//         productRiview:req.body.productRiview});
//         res.status(200).send(result);
//     }catch(error){
//          res.status(403).send("خطا!محصول ویرایش نشد");
//     }
// });




// //------------************ main web api ************------------


router.get("/getAllBlogPost" , async (req , res)=>{
    function isNum(val){
        return  Number.isInteger(val)
      }
      var endPoint;
      if(req.query.language === 'persian'){
          endPoint = blog;
      }else if(req.query.language === 'arabic'){
          endPoint = blogAr;
      }else if(req.query.language === 'english'){
          endPoint = blogEn;
      }
    var totalDocument  = [];
    totalDocument =  await endPoint.find({ deleteDate:null , validation:true}).exec();
    if(req.query.filter === 'last'){
        totalDocument = totalDocument.sort(function compare(a, b) {
            var dateA = new Date(a.insertDate);
            var dateB = new Date(b.insertDate);
            return dateA - dateB;
          });
          totalDocument.reverse();
    }else if(req.query.filter === 'old'){
        totalDocument = totalDocument.sort(function compare(a, b) {
            var dateA = new Date(a.insertDate);
            var dateB = new Date(b.insertDate);
            return dateA - dateB;
          });
    }else if(req.query.filter === 'exp'){
        const sorter = (a, b) => {
            return +a.price.price - +b.price.price;
         };
         totalDocument.sort(sorter);
         totalDocument.reverse();
    }else if(req.query.filter === 'ch'){
        const sorter = (a, b) => {
            return +a.price.price - +b.price.price;
         };
         totalDocument.sort(sorter);
    }


    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    var totalPages = 0;

    var docCountTemp = '';

        docCountTemp = totalDocument.length/limit; 
    if(isNum(docCountTemp)){
        totalPages=docCountTemp;
    }else{
        totalPages = Math.floor(docCountTemp)+1;
    }

    var docCountTemp2 = '';

        docCountTemp2 =totalDocument.length;

   if(endIndex < docCountTemp2){
    results.next = {
      total: totalPages  ,
        page : page + 1,
        limit: limit
    }
   }
    if(startIndex > 0) {
        results.previous = {
      total: totalPages,
            page : page - 1 ,
            limit : limit 
        }
    }
    results.now ={
      total: totalPages  ,
      page : page,
      limit: 10  
  
    }
    
    try{
        results.results = totalDocument.slice(startIndex, limit + startIndex);
        var rating = 0;
        var finalRes = [];
            for(var i = 0 ; results.results.length > i ; i++){
                const comments = await comment.find({targetPost:results.results[i]._id , validation:true , deleteDate:null});
                
                finalRes.push({result:results.results[i] , comment:comments.length})
            }
            
        res.status(200).send({next:results.next , now:results.now , previous:results.previous , results:finalRes});
        }catch(error){
        res.status(500).send('مشکلی پیش آمده');
    }
  })


  router.get("/getTheBlogForMain" ,async (req , res)=>{
    var json = {}
    var response;

    try{  
        if(req.query.language === 'persian'){
            response = await blog.findOne({deleteDate:null , validation:true , _id:req.query.id});
            tempRes = response;
        }else if(req.query.language === 'arabic'){
            response = await blogAr.findOne({deleteDate:null , validation:true  , _id:req.query.id});
            tempRes = response;
        }else if(req.query.language === 'english'){
            response = await blogEn.findOne({deleteDate:null , validation:true  , _id:req.query.id});
            tempRes = response;
        }
        json.product =response; 
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});
router.get("/getLastSixBlogs" ,async (req , res)=>{
    var json = {}
    var response;

    try{  
        if(req.query.language === 'persian'){
            response = await blog.find({deleteDate:null , validation:true});
            tempRes = response;
        }else if(req.query.language === 'arabic'){
            response = await blogAr.find({deleteDate:null , validation:true});
            tempRes = response;
        }else if(req.query.language === 'english'){
            response = await blogEn.find({deleteDate:null , validation:true});
            tempRes = response;
        }
        var tempArr = [];
        var finalArr = [];
        tempArr = response.sort(function compare(a, b) {
                var dateA = new Date(a.insertDate);
                var dateB = new Date(b.insertDate);
                return dateA - dateB;
              });
              tempArr.reverse();
              finalArr = tempArr.slice(0, 6 );
        json.product =finalArr; 
        res.status(200).send(finalArr);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});
module.exports = router;    