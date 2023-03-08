const express = require('express');
const mongoose = require("mongoose");
const multer = require('multer');
const verify = require("../users/verifyToken");
const productModel = require("../../models/productModel"); 
const featureListModel = require("../../models/featureListModel");
const userModel = require("../../models/userModel");
const dbConnection = require('../../connections/fa_connection');
const dbConnection2 = require('../../connections/ar_connection');
const dbConnection3 = require('../../connections/en_connection');
const { create } = require('xmlbuilder2');
const tagModel = require("../../models/tagModel");
const categoryModel = require("../../models/categoryModel");
const { result } = require('@hapi/joi/lib/base');
const commentModel = require("../../models/commentModel");
const fs = require('fs');
const router = express.Router()

const product = dbConnection.model("product" ,productModel );
const user = dbConnection.model("user" ,userModel);
const category = dbConnection.model("category" ,categoryModel );
const tag = dbConnection.model("tag" ,tagModel );
const comment = dbConnection.model('comment' , commentModel);
const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip } = require('zlib')
const { Readable } = require('stream')
const { createReadStream } = require('fs')
const { parseSitemap, createSitemap } = require('sitemap')
const productAr = dbConnection2.model("product" ,productModel );
const categoryAr = dbConnection2.model("category" ,categoryModel );
const tagAr = dbConnection2.model("tag" ,tagModel );

const productEn = dbConnection3.model("product" ,productModel);
const categoryEn = dbConnection3.model("category" ,categoryModel );
const tagEn = dbConnection3.model("tag" ,tagModel );

router.post("/validationProduct" , verify , async (req , res , next)=>{
    if(req.body.language === 'persian'){
        if(await product.findOne({_id:req.body.id , validation:true}).exec()){
            try{
                const response = await product.updateOne({_id:req.body.id} , {validation:false});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await product.updateOne({_id:req.body.id} , {validation:true});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                  console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }

    }else if(req.body.language === 'arabic'){
        if(await productAr.findOne({_id:req.body.id , validation:true}).exec()){
            try{
                const response = await productAr.updateOne({_id:req.body.id} , {validation:false});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await productAr.updateOne({_id:req.body.id} , {validation:true});
                const data = response;
                res.status(200).send(data);
                
             }catch(error){
                  console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }

    }else if(req.body.language === 'english'){
        if(await productEn.findOne({_id:req.body.id , validation:true}).exec()){
            try{
                const response = await productEn.updateOne({_id:req.body.id} , {validation:false});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await productEn.updateOne({_id:req.body.id} , {validation:true});
                const data = response;
                res.status(200).send(data);
                
             }catch(error){
                  console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }

    }

});
router.post("/priceUpdate" , verify , async (req , res , next)=>{
    var productDbConnection;
    if(req.body.language === 'persian'){
        productDbConnection = product;
    }else if(req.body.language === 'arabic'){
        productDbConnection = productAr;
    }else if(req.body.language === 'english'){
        productDbConnection = productEn;
    }
    try{
        const response = await productDbConnection.updateOne({_id:req.body.id} , {'price.price':req.body.price , updateDate:Date.now()});
        const data = response;
        res.status(200).send(data);
     }catch(error){
          res.status(403).send("خطایی رخ داده است!");
     }
});
router.post("/stockUpdate" , verify , async (req , res , next)=>{
    if(req.body.language === 'persian'){
        if(await product.findOne({_id:req.body.id , stock:true}).exec()){
            try{
                const response = await product.updateOne({_id:req.body.id} , {stock:false ,updateDate:Date.now()});
                const data = response;
                res.status(200).send(data);
                
             }catch(error){
                  res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await product.updateOne({_id:req.body.id} , {stock:true ,updateDate:Date.now()});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                 console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }
    }else if(req.body.language === 'arabic'){
        if(await productAr.findOne({_id:req.body.id , stock:true}).exec()){
            try{
                const response = await productAr.updateOne({_id:req.body.id} , {stock:false ,updateDate:Date.now()});
                const data = response;
                res.status(200).send(data);
                
             }catch(error){
                  res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await productAr.updateOne({_id:req.body.id} , {stock:true ,updateDate:Date.now()});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                 console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }

    }else if(req.body.language === 'english'){
        if(await productEn.findOne({_id:req.body.id , stock:true}).exec()){
            try{
                const response = await productEn.updateOne({_id:req.body.id} , {stock:false ,updateDate:Date.now()});
                const data = response;
                res.status(200).send(data);
                
             }catch(error){
                  res.status(403).send("خطایی رخ داده است!");
             }
        }else{
            try{
                const response = await productEn.updateOne({_id:req.body.id} , {stock:true ,updateDate:Date.now()});
                const data = response;
                res.status(200).send(data);
             }catch(error){
                 console.log(error);
                  res.status(403).send("خطایی رخ داده است!");
             }
        }
    }


    
});
//get all products
router.get("/getAllProducts" , verify ,async(req , res)=>{
    var length;
    var result;
    try{
        if(req.query.language === 'persian'){
            length = await product.countDocuments({deleteDate:null});
            result = await product.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }else if(req.query.language === 'arabic'){
            length = await productAr.countDocuments({deleteDate:null});
            result = await productAr.find({deleteDate:null}).limit(parseInt(req.query.limit));
        }else if(req.query.language === 'english'){
            length = await productEn.countDocuments({deleteDate:null});
            result = await productEn.find({deleteDate:null}).limit(parseInt(req.query.limit));
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
           res.status(500).send("مشکلی رخ داده است");
    }
    
});


    
router.post("/searchInProduct", verify , async (req , res , next)=>{
    // var regex = new RegExp(req.body.searching, "i");
    var searched;
    if(req.body.searching){
        try{
            if(req.body.language === 'persian'){
                searched = await product.find({
                    deleteDate:null,
                    "title" :   { "$regex": req.body.searching, "$options":"i"}
                }).limit(parseInt(20));
            }else if(req.body.language === 'arabic'){
                searched = await productAr.find({
                    deleteDate:null,
                    "title" :   { "$regex": req.body.searching, "$options":"i"}
                }).limit(parseInt(20));
            }else if(req.body.language === 'english'){
                searched = await productEn.find({
                    deleteDate:null,
                    "title" :   { "$regex": req.body.searching, "$options":"i"}
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
                        finalArr.push({product:searched[i] , author:rs2[j]});
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

//delete product
router.post("/deleteProduct", verify , async (req , res , next)=>{
    if(req.body.productId){
        try{
            if(req.body.language === 'persian'){
                await product.findOneAndUpdate({_id:req.body.productId} , {deleteDate:Date.now()});
            }else if(req.body.language === 'arabic'){
                await productAr.findOneAndUpdate({_id:req.body.productId} , {deleteDate:Date.now()});
            }else if(req.body.language === 'english'){
                await productEn.findOneAndUpdate({_id:req.body.productId} , {deleteDate:Date.now()});
            }
            res.status(200).send("محصول حذف شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، دسته بندی حذف نشد");
        }
    }
});




//product list

router.get("/productListByCategory" , verify , async (req , res)=>{

    function isNum(val){
        return  Number.isInteger(val)
      }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    var totalPages = 0;
    var endPoint;
    if(req.query.language === 'persian'){
        endPoint = product;
    }else if(req.query.language === 'arabic'){
        endPoint = productAr;
    }else if(req.query.language === 'english'){
        endPoint = productEn;
    }
    const docCountTemp = await endPoint.countDocuments({categories:req.query.id , deleteDate:null}).exec()/limit; 
    if(isNum(docCountTemp)){
        totalPages=docCountTemp;
    }else{
        totalPages = Math.floor(docCountTemp)+1;
    }
   if(endIndex < await endPoint.countDocuments({categories:req.query.id ,deleteDate:null}).exec()){
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
      total: totalPages,
      page : page,
      limit: 10  
    }
    try{
        results.results = await endPoint.find({categories:req.query.id , deleteDate:null}).limit(limit).skip(startIndex).exec();
        res.status(200).send(results);
        }catch(error){
        res.status(500).send('مشکلی پیش آمده');
    }
  })



  router.post("/deleteProduct", verify, async (req , res , next)=>{
    if(req.body.productId){
        try{
            if(req.body.language === 'persian'){
                await product.findOneAndUpdate({_id:req.body.productId} , {deleteDate:Date.now()});
            }else if(req.body.language === 'arabic'){
                await productAr.findOneAndUpdate({_id:req.body.productId} , {deleteDate:Date.now()});
            }else if(req.body.language === 'english'){
                await productEn.findOneAndUpdate({_id:req.body.productId} , {deleteDate:Date.now()});
            }   
            res.status(200).send("محصول حذف شد");
        }catch(error){
             res.status(403).send("مشکلی پیش آمده، دسته بندی حذف نشد");
        }
    }
});




//product list

router.get("/productListByTag", verify  , async (req , res)=>{

    function isNum(val){
        return  Number.isInteger(val)
      }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    var totalPages = 0;
    var endPoint;
    if(req.query.language === 'persian'){
        endPoint = product;
    }else if(req.query.language === 'arabic'){
        endPoint = productAr;
    }else if(req.query.language === 'english'){
        endPoint = productEn;
    }
    const docCountTemp = await endPoint.countDocuments({tags:req.query.id , deleteDate:null}).exec()/limit; 
    if(isNum(docCountTemp)){
        totalPages=docCountTemp;
        
    }else{
        totalPages = Math.floor(docCountTemp)+1;
       
    }
   if(endIndex < await endPoint.countDocuments({tags:req.query.id ,deleteDate:null}).exec()){
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
        results.results = await endPoint.find({tags:req.query.id , deleteDate:null}).limit(limit).skip(startIndex).exec();
        res.status(200).send(results);
        }catch(error){
        res.status(500).send('مشکلی پیش آمده');
    }
  })



  //search list

router.get("/productListByCategorySearch", verify  , async (req , res)=>{

    function isNum(val){
        return  Number.isInteger(val)
      }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    var totalPages = 0;
    var endPoint;
    if(req.query.language === 'persian'){
        endPoint = product;
    }else if(req.query.language === 'arabic'){
        endPoint = productAr;
    }else if(req.query.language === 'english'){
        endPoint = productEn;
    }
    const docCountTemp = await endPoint.countDocuments({categories:req.query.id , deleteDate:null , "title" :   { "$regex": req.query.title, "$options":"i"}}).exec()/limit; 
    if(isNum(docCountTemp)){
        totalPages=docCountTemp;
        console.log(totalPages);
    }else{
        totalPages = Math.floor(docCountTemp)+1;
        console.log(totalPages);
    }
   if(endIndex < await endPoint.countDocuments({categories:req.query.id ,deleteDate:null ,"title" :   { "$regex": req.query.title, "$options":"i"}}).exec()){
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
        results.results = await endPoint.find({categories:req.query.id , deleteDate:null ,"title" :   { "$regex": req.query.title, "$options":"i"}}).limit(limit).skip(startIndex).exec();
        res.status(200).send(results);
        }catch(error){
        res.status(500).send('مشکلی پیش آمده');
    }
  })


  router.get("/productListByTagSearch", verify  , async (req , res)=>{

    function isNum(val){
        return  Number.isInteger(val)
      }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    var endPoint;
    if(req.query.language === 'persian'){
        endPoint = product;
    }else if(req.query.language === 'arabic'){
        endPoint = productAr;
    }else if(req.query.language === 'english'){
        endPoint = productEn;
    }
    var totalPages = 0;
    const docCountTemp = await endPoint.countDocuments({tags:req.query.id , deleteDate:null , "title" :   { "$regex": req.query.title, "$options":"i"}}).exec()/limit; 
    if(isNum(docCountTemp)){
        totalPages=docCountTemp;
        console.log(totalPages);
    }else{
        totalPages = Math.floor(docCountTemp)+1;
        console.log(totalPages);
    }
   if(endIndex < await endPoint.countDocuments({tags:req.query.id ,deleteDate:null ,"title" :   { "$regex": req.query.title, "$options":"i"}}).exec()){
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
        results.results = await endPoint.find({tags:req.query.id , deleteDate:null ,"title" :   { "$regex": req.query.title, "$options":"i"}}).limit(limit).skip(startIndex).exec();
        res.status(200).send(results);
        }catch(error){
        res.status(500).send('مشکلی پیش آمده');
    }
  })

  //the product
router.get("/getTheProduct", verify ,async(req , res)=>{
    var result;
    try{
        if(req.query.language === 'persian'){
            result = await product.findOne({deleteDate:null , _id:req.query.id});
        }else if(req.query.language === 'arabic'){
            result = await productAr.findOne({deleteDate:null , _id:req.query.id});
        }else if(req.query.language === 'english'){
            result = await productEn.findOne({deleteDate:null , _id:req.query.id});
        }
        res.status(200).send(result); 
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }
    
});





//------------************ main web api ************------------

router.get("/productListByCategoryAndTagMain" , async (req , res)=>{

    function isNum(val){
        return  Number.isInteger(val)
      }

    var totalDocument  = [];
    if(req.query.state === 'category'){
        if(req.query.language === 'persian'){
            totalDocument =  await product.find({categories:req.query.id , deleteDate:null , validation:true}).exec();

        }else if(req.query.language === 'arabic'){
            totalDocument =  await productAr.find({categories:req.query.id , deleteDate:null , validation:true}).exec();

        }else if(req.query.language === 'english'){
            totalDocument =  await productEn.find({categories:req.query.id , deleteDate:null , validation:true}).exec();

        }
    }else if(req.query.state === 'tag'){
        if(req.query.language === 'persian'){
            totalDocument =  await product.find({tags:req.query.id , deleteDate:null , validation:true}).exec();
        }else if(req.query.language === 'arabic'){
            totalDocument =  await productAr.find({tags:req.query.id , deleteDate:null , validation:true}).exec();
        }else if(req.query.language === 'english'){
            totalDocument =  await productEn.find({tags:req.query.id , deleteDate:null , validation:true}).exec();

        }
    }
    // var max = 0; 
    // var min = totalDocument[1].price.price;
    // for(var x = 0 ; totalDocument.length > x ; x++){
    //     if(totalDocument[x].price.price > max){
    //         max = totalDocument[x].price.price;
    //     }
    //     if(totalDocument[x].price.price < min){
    //         min = totalDocument[x].price.price; 
    //     }
    // }

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
    console.log(totalDocument)
    try{
        results.results = totalDocument.slice(startIndex, limit + startIndex);
        var rating = 0;
        var finalRes = [];
            for(var i = 0 ; results.results.length > i ; i++){
                const rate = await comment.find({targetPost:results.results[i]._id , validation:true , deleteDate:null}).select('rate');
                
                for(var j = 0 ; rate.length > j ; j++){
                    if(rate[j].rate !== null){
                        rating = rate[j].rate + rating;
                    }
                }
                rating/rate.length;
                finalRes.push({result:results.results[i] , rate:rating})
            }
            
        res.status(200).send({next:results.next , now:results.now , previous:results.previous , results:finalRes});

        }catch(error){
        res.status(500).send('مشکلی پیش آمده');
    }
  })




  router.get("/productListForCardFullListMain" , async (req , res)=>{

    function isNum(val){
        return  Number.isInteger(val)
      }
      var endPoint;
      if(req.query.language === 'persian'){
          endPoint = product;
      }else if(req.query.language === 'arabic'){
          endPoint = productAr;
      }else if(req.query.language === 'english'){
          endPoint = productEn;
      }
    var totalDocument  = [];
    totalDocument =  await endPoint.find({ deleteDate:null , validation:true}).exec();
    
    if(req.query.lable === 'last'){
        totalDocument = totalDocument.sort(function compare(a, b) {
            var dateA = new Date(a.insertDate);
            var dateB = new Date(b.insertDate);
            return dateA - dateB;
          });
          totalDocument.reverse();
    }else if(req.query.lable === 'old'){
        totalDocument = totalDocument.sort(function compare(a, b) {
            var dateA = new Date(a.insertDate);
            var dateB = new Date(b.insertDate);
            return dateA - dateB;
          });
    }else if(req.query.lable === 'exp'){
        const sorter = (a, b) => {
            return +a.price.price - +b.price.price;
         };
         totalDocument.sort(sorter);
         totalDocument.reverse();
    }else if(req.query.lable === 'ch'){
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
                const rate = await comment.find({targetPost:results.results[i]._id , validation:true , deleteDate:null}).select('rate');
                
                for(var j = 0 ; rate.length > j ; j++){
                    if(rate[j].rate !== null){
                        rating = rate[j].rate + rating;
                    }
                }
                rating/rate.length;
                finalRes.push({result:results.results[i] , rate:rating})
            }
            
        res.status(200).send({next:results.next , now:results.now , previous:results.previous , results:finalRes});
        }catch(error){
        res.status(500).send('مشکلی پیش آمده');
    }
  })



  


  //get all products
    router.get("/getAllProductsForMain"  ,async(req , res)=>{
        var result =[];
        var rating = 0;
        var ratedProduct = [];
        var finalRes = [];
        var endPoint;
        if(req.query.language === 'persian'){
            endPoint = product;
        }else if(req.query.language === 'arabic'){
            endPoint = productAr;
        }else if(req.query.language === 'english'){
            endPoint = productEn;
        }
        try{
            const length = await endPoint.countDocuments({deleteDate:null , validation:true});
            result = await endPoint.find({deleteDate:null , validation:true});
            for(var i = 0 ; result.length > i ; i++){
                const rate = await comment.find({targetPost:result[i]._id , validation:true , deleteDate:null}).select('rate');
                for(var j = 0 ; rate.length > j ; j++){
                    if(rate[j].rate !== null){
                        rating = rate[j].rate + rating;
                        ratedProduct.push(rate[j]);
                    }
                }
                rating/ratedProduct.length;
                finalRes.push({result:result[i] , rate:rating})
            }
            res.status(200).send(JSON.stringify({ln:length , rs:finalRes})); 
        }catch(err){
            res.status(500).send("مشکلی رخ داده است");
        }
});




router.get("/searchForMainThing" , async (req , res , next)=>{
    var tempArr = [];
    var productDbConnection;
    var categoryDbConnection;
    var tagDbConnection;
    if(req.query.language === 'persian'){
        productDbConnection = product;
        categoryDbConnection = category;
        tagDbConnection = tag;
    }else if(req.query.language === 'arabic'){
        productDbConnection = productAr;
        categoryDbConnection = categoryAr;
        tagDbConnection = tagAr;
    }else if(req.query.language === 'english'){
        productDbConnection = productEn;
        categoryDbConnection = categoryEn;
        tagDbConnection = tagEn;
    }
    try{
        if(req.query.searching){
            const productSearch = await productDbConnection.find({
                deleteDate:null,
                "title" :   { "$regex": req.query.searching, "$options":"i"}
            }).select('title , _id').limit(parseInt(10));
            const categorySearch = await categoryDbConnection.find({
                deleteDate:null,
                "category" :   { "$regex": req.query.searching, "$options":"i"}
            }).select('category , _id').limit(parseInt(10));

            const tagSearch = await tagDbConnection.find({
                deleteDate:null,
                "tag" :   { "$regex": req.query.searching, "$options":"i"}
            }).select('tag , _id').limit(parseInt(10));
            tempArr = [...productSearch , ...categorySearch , ...tagSearch];
            function shuffle(array) {
                let currentIndex = array.length,  randomIndex;
              
                // While there remain elements to shuffle...
                while (currentIndex != 0) {
                  // Pick a remaining element...
                  randomIndex = Math.floor(Math.random() * currentIndex);
                  currentIndex--;
                  // And swap it with the current element.
                  [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
                }
              
                return array;
              }
              shuffle(tempArr);
            res.status(200).send(tempArr);
        }
    }catch{
        res.status(500).send("خطایی رخ داده است");
    }
 
});




router.get("/productsId" , async (req , res , next)=>{


      
        try {
            const responsePr =await product.find({deleteDate:null , validation:true}).select('_id');
            const responseEn =await productEn.find({deleteDate:null , validation:true}).select('_id');
            const responseAr =await productAr.find({deleteDate:null , validation:true}).select('_id');

            const urlsList = [];
            for(var i = 0 ; responsePr.length > i ; i++){
                urlsList.push({ url: `https://lazulitemarble.com/pr/showCase/${responsePr[i]._id}`,  changefreq: 'daily', priority: 0.8  })
            }
            for(var j = 0 ; responseEn.length > j ; j++){
                urlsList.push({ url: `https://lazulitemarble.com/en/showCase/${responseEn[j]._id}`,  changefreq: 'daily', priority: 0.8  })
            }
            for(var l = 0 ; responseAr.length > l ; l++){
                urlsList.push({ url: `https://lazulitemarble.com/ar/showCase/${responseAr[l]._id}`,  changefreq: 'daily', priority: 0.8  })
            }
            urlsList.push({ url: 'https://lazulitemarble.com/pr/shiping',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/pr/blog',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/pr/branches',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/pr/projects',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/pr',  changefreq: 'daily', priority: 0.8  });


            urlsList.push({ url: 'https://lazulitemarble.com/en/shiping',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/en/blog',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/en/branches',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/en/projects',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/en',  changefreq: 'daily', priority: 0.8  });


            urlsList.push({ url: 'https://lazulitemarble.com/ar/shiping',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/ar/blog',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/ar/branches',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/ar/projects',  changefreq: 'daily', priority: 0.8  });
            urlsList.push({ url: 'https://lazulitemarble.com/ar',  changefreq: 'daily', priority: 0.8  });
            // An array with your links
            const links = [{ url: urlsList,  changefreq: 'daily', priority: 0.8  }]

            // Create a stream to write to
            const stream = new SitemapStream( { hostname: 'https://lazulitemarble.com' } )

            // Return a promise that resolves with your XML string
            return streamToPromise(Readable.from(urlsList).pipe(stream)).then((data) =>{
                const doc = create(data.toString());
                const xml = doc.end({ prettyPrint: true });
                fs.writeFile('./public/sitemap.xml', xml, function (err) {
                    if (err) throw err; 
                     res.status(200).send('https://api.lazulitemarble.com/sitemap.xml');
                  }); 

            }
    
            )

        } catch (e) {
          console.error(e)
          res.status(500).end()
        }
  
 
});







module.exports = router;     