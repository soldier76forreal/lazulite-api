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


router.get("/allProducts" , verify , async (req , res , next)=>{
    var finalArray = [];
    try{
        const persian = await product.find({deleteDate:null , validation:true}).select("_id  , title");
        const arabic = await productAr.find({deleteDate:null , validation:true}).select("_id  , title");
        const english = await productEn.find({deleteDate:null , validation:true}).select("_id  , title");
        for(var i=0 ; persian.length > i ; i++){
            finalArray.push(persian[i]);
        }
        for(var j=0 ; arabic.length > j ; j++){
            finalArray.push(arabic[j]);
        }
        for(var l=0 ; english.length > l ; l++){
            finalArray.push(english[l]);
        }
        res.status(200).send(finalArray);
     }catch(error){
        console.log(error);
          res.status(403).send("خطایی رخ داده است!");
     }
});





module.exports = router;     