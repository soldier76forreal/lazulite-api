const express = require('express');
const mongoose = require("mongoose");
const tagModel = require("../../models/tagModel");
const categoryModel = require("../../models/categoryModel");
const verify = require("../users/verifyToken");
const productModel = require("../../models/productModel"); 
const {opratorModel} = require("../../models/opratorModel");
const {whatsAppOpratorModel} = require("../../models/opratorModel");
const featureListModel = require("../../models/featureListModel");

const { json } = require('body-parser');
const { findOneAndUpdate } = require('../../models/tagModel');
const router = express.Router()
const commentModel = require("../../models/commentModel");

const dbConnection = require('../../connections/fa_connection');
const dbConnection2 = require('../../connections/ar_connection');
const dbConnection3 = require('../../connections/en_connection');
const product = dbConnection.model("product" ,productModel );
const category = dbConnection.model("category" ,categoryModel );
const tag = dbConnection.model("tag" ,tagModel);
const opratorM = dbConnection.model("oprator" ,opratorModel);
const waOpratorM = dbConnection.model("whatsAppOprator" ,whatsAppOpratorModel);
const featureList = dbConnection.model("featureList" ,featureListModel );
const comment = dbConnection.model('comment' , commentModel);


//get all category
router.get("/getAllCategories", verify ,async (req , res)=>{
    try{
        const response =await category.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});
router.get("/getAllTags", verify ,async (req , res)=>{
    tag.find().where('categoriesId').in(
        req.query.categoriesId
    ).exec((err, records) => {
        if(err){
            res.status(500).send("مشکلی رخ داده است");

        }else if(records){
            res.status(200).send(records);
        }
    });
});

router.get("/getAllOprator", verify ,async (req , res)=>{
    try{
        const response =await opratorM.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});

router.get("/getAllWaOprator" , verify,async (req , res)=>{
    try{
        const response =await waOpratorM.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});
router.post("/saveNewProduct" , verify,async (req , res)=>{
    var newProduct = new product({
        title:req.body.title,
        price:req.body.price,
        contactButtons:req.body.contactBtn,
        images:req.body.images,
        categories:req.body.categories,
        tags:req.body.tags,
        productCode:req.body.productCode,
        availableSurface:req.body.availableSurface,
        features:req.body.featureList,
        keyFeatures:req.body.keyFeatures,
        author:req.body.author,
        productRiview:req.body.productRiview
    })
    try{
        const result = await newProduct.save();
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!محصول ذخیره نشد");
         console.log(error)
    }
});


//feature Name
router.post("/newFeatureList", verify , async (req , res , next)=>{

    var newFeatureList = new featureList({
        listName:req.body.listName,
        featureList:req.body.featureList,
    })
    try{
        const result = await newFeatureList.save();
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("دسته بندی تکراری است");
    }
});


router.get("/getAllFeatureList", verify ,async (req , res)=>{
    try{
        const response =await featureList.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});
router.get("/getTheList", verify ,async (req , res)=>{
    try{
        const response =await featureList.findOne({deleteDate:null , _id:req.query.listId});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});



router.get("/getProduct" , verify,async (req , res)=>{
    var json = {}
    try{
        var response =await product.findOne({deleteDate:null , _id:req.query.id});
        var tempRes = response;
        const whatsAppContact =await waOpratorM.findOne({deleteDate:null , _id:response.contactButtons[0]});
        const phoneContact =await opratorM.findOne({deleteDate:null , _id:response.contactButtons[1]});
        json.product =response; 
        json.phoneContacts = [whatsAppContact,phoneContact];
        res.status(200).send(json);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});

//delete category
router.post("/deleteFeatureList", verify, async (req , res , next)=>{
    if(req.body.deleteTheListId){
        try{
           await featureList.findOneAndUpdate({_id:req.body.deleteTheListId} , {deleteDate:Date.now()});
            res.status(200).send("لیست مورد نظر حذف شد");
        }catch(error){
             res.status(403).send("خطا!لیست حذف نشد");
        }
    }
});


router.post("/updateProduct" , verify ,async (req , res)=>{
    try{
        const result = await product.findOneAndUpdate({_id:req.body.productIdToUpdate} 
            , {title:req.body.title,
            price:req.body.price,
            contactButtons:req.body.contactBtn,
            images:req.body.images,
            categories:req.body.categories,
            tags:req.body.tags,
            features:req.body.featureList,
            keyFeatures:req.body.keyFeatures,
            productCode:req.body.productCode,
            availableSurface:req.body.availableSurface,
            updateDate:Date.now(),
            productRiview:req.body.productRiview})
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!محصول ویرایش نشد");
    }
});




//------------************ main web api ************------------
router.get("/getProductForMain" ,async (req , res)=>{
    var json = {}
    try{
        var response =await product.findOne({deleteDate:null , validation:true , _id:req.query.id});
        var tempRes = response;
        var overalRate = 0;
        var commentsLength = [];

        const comments = await comment.find({validation:true , deleteDate:null , targetPost:req.query.id });
        if(comments.length ===0){
            overalRate = 0;
        }else{
            for(var i = 0 ; comments.length > i ; i++){
                if(comments[i].rate !== null){
                    commentsLength.push(comments[i].rate);
                    overalRate = comments[i].rate + overalRate;
                }
            }
            overalRate = overalRate/commentsLength.length;
        }

        

        const whatsAppContact =await waOpratorM.findOne({deleteDate:null , _id:response.contactButtons[0]}).select('firstName , lastName , phoneNumber , _id');
        const phoneContact =await opratorM.findOne({deleteDate:null ,  _id:response.contactButtons[1]}).select('firstName , lastName , phoneNumbers , _id');
        json.product =response; 
        json.phoneContacts = [whatsAppContact,phoneContact];
        json.productRate = overalRate;
        res.status(200).send(json);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});


//---------------------------------------------------------------Arabic---------------------------------------------------------

const productAr = dbConnection2.model("product" ,productModel );
const categoryAr = dbConnection2.model("category" ,categoryModel );
const tagAr = dbConnection2.model("tag" ,tagModel);

const featureListAr = dbConnection2.model("featureList" ,featureListModel );
const opratorMAr = dbConnection2.model("oprator" ,opratorModel);
const waOpratorMAr = dbConnection2.model("whatsAppOprator" ,whatsAppOpratorModel);

//get all category
router.get("/getAllCategoriesAr", verify ,async (req , res)=>{
    try{
        const response =await categoryAr.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});

router.get("/getAllTagsAr", verify ,async (req , res)=>{
    tagAr.find().where('categoriesId').in(
        req.query.categoriesId
    ).exec((err, records) => {
        if(err){
            res.status(500).send("مشکلی رخ داده است");

        }else if(records){
            res.status(200).send(records);
        }
    });
});

router.get("/getAllOpratorAr", verify ,async (req , res)=>{
    try{
        const response =await opratorMAr.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }
});

router.get("/getAllWaOpratorAr" , verify,async (req , res)=>{
    try{
        const response =await waOpratorMAr.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }
});

router.post("/saveNewProductAr" , verify,async (req , res)=>{
    var newProduct = new productAr({
        title:req.body.title,
        price:req.body.price,
        contactButtons:req.body.contactBtn,
        images:req.body.images,
        categories:req.body.categories,
        tags:req.body.tags,
        features:req.body.featureList,
        keyFeatures:req.body.keyFeatures,
        author:req.body.author,
        productRiview:req.body.productRiview
    })
    try{
        const result = await newProduct.save();
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!محصول ذخیره نشد");
    }
});


//feature Name
router.post("/newFeatureListAr", verify , async (req , res , next)=>{

    var newFeatureList = new featureListAr({
        listName:req.body.listName,
        featureList:req.body.featureList,
    })
    try{
        const result = await newFeatureList.save();
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("دسته بندی تکراری است");
    }
});


router.get("/getAllFeatureListAr", verify ,async (req , res)=>{
    try{
        const response =await featureListAr.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});
router.get("/getTheListAr", verify ,async (req , res)=>{
    try{
        const response =await featureListAr.findOne({deleteDate:null , _id:req.query.listId});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});



router.get("/getProductAr" , verify,async (req , res)=>{
    var json = {}
    try{
        var response =await productAr.findOne({deleteDate:null , _id:req.query.id});
        var tempRes = response;
        const whatsAppContact =await waOpratorMAr.findOne({deleteDate:null , _id:response.contactButtons[0]});
        const phoneContact =await opratorMAr.findOne({deleteDate:null , _id:response.contactButtons[1]});
        json.product =response; 
        json.phoneContacts = [whatsAppContact,phoneContact];
        res.status(200).send(json);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});

//delete category
router.post("/deleteFeatureListAr", verify, async (req , res , next)=>{
    if(req.body.deleteTheListId){
        try{
           await featureListAr.findOneAndUpdate({_id:req.body.deleteTheListId} , {deleteDate:Date.now()});
            res.status(200).send("لیست مورد نظر حذف شد");
        }catch(error){
             res.status(403).send("خطا!لیست حذف نشد");
        }
    }
});


router.post("/updateProductAr" , verify ,async (req , res)=>{
    try{
        const result = await productAr.findOneAndUpdate({_id:req.body.productIdToUpdate} 
            , {title:req.body.title,
            price:req.body.price,
            contactButtons:req.body.contactBtn,
            images:req.body.images,
            categories:req.body.categories,
            tags:req.body.tags,
            features:req.body.featureList,
            keyFeatures:req.body.keyFeatures,
            updateDate:Date.now(),
            productRiview:req.body.productRiview})
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!محصول ویرایش نشد");
    }
});


//------------************ main web api ************------------
router.get("/getProductForMainAr" ,async (req , res)=>{
    var json = {}
    try{
        var response =await productAr.findOne({deleteDate:null , validation:true , _id:req.query.id});
        var tempRes = response;
        var overalRate = 0;
        var commentsLength = [];

        const comments = await comment.find({validation:true , deleteDate:null , targetPost:req.query.id });
        if(comments.length ===0){
            overalRate = 0;
        }else{
            for(var i = 0 ; comments.length > i ; i++){
                if(comments[i].rate !== null){
                    commentsLength.push(comments[i].rate);
                    overalRate = comments[i].rate + overalRate;
                }
            }
            overalRate = overalRate/commentsLength.length;
        }

        

        const whatsAppContact =await waOpratorMAr.findOne({deleteDate:null , _id:response.contactButtons[0]}).select('firstName , lastName , phoneNumber , _id');
        const phoneContact =await opratorMAr.findOne({deleteDate:null ,  _id:response.contactButtons[1]}).select('firstName , lastName , phoneNumbers , _id');
        json.product =response; 
        json.phoneContacts = [whatsAppContact,phoneContact];
        json.productRate = overalRate;
        res.status(200).send(json);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});



//---------------------------------------------------------------English---------------------------------------------------------

const productEn = dbConnection3.model("product" ,productModel );
const categoryEn = dbConnection3.model("category" ,categoryModel );
const tagEn = dbConnection3.model("tag" ,tagModel);

const featureListEn = dbConnection3.model("featureList" ,featureListModel );
const opratorMEn = dbConnection3.model("oprator" ,opratorModel);
const waOpratorMEn = dbConnection3.model("whatsAppOprator" ,whatsAppOpratorModel);

//get all category
router.get("/getAllCategoriesEn", verify ,async (req , res)=>{
    try{
        const response =await categoryEn.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});
router.get("/getAllTagsEn", verify ,async (req , res)=>{
    tagEn.find().where('categoriesId').in(
        req.query.categoriesId
    ).exec((err, records) => {
        if(err){
            res.status(500).send("مشکلی رخ داده است");

        }else if(records){
            res.status(200).send(records);

        }
    });

});

router.get("/getAllOpratorEn", verify ,async (req , res)=>{
    try{
        const response =await opratorMEn.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});

router.get("/getAllWaOpratorEn" , verify,async (req , res)=>{
    try{
        const response =await waOpratorMEn.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }

});
router.post("/saveNewProductEn" , verify,async (req , res)=>{
    var newProduct = new productEn({
        title:req.body.title,
        price:req.body.price,
        contactButtons:req.body.contactBtn,
        images:req.body.images,
        categories:req.body.categories,
        tags:req.body.tags,
        productCode:req.body.productCode,
        availableSurface:req.body.availableSurface,
        features:req.body.featureList,
        keyFeatures:req.body.keyFeatures,
        author:req.body.author,
        productRiview:req.body.productRiview
    })
    try{
        const result = await newProduct.save();
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!محصول ذخیره نشد");
         console.log(error)
    }
});


//feature Name
router.post("/newFeatureListEn", verify , async (req , res , next)=>{
    var newFeatureList = new featureListEn({
        listName:req.body.listName,
        featureList:req.body.featureList,
    })
    try{
        const result = await newFeatureList.save();
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("دسته بندی تکراری است");
    }
});
router.get("/getAllFeatureListEn", verify ,async (req , res)=>{
    try{
        const response =await featureListEn.find({deleteDate:null});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }
});
router.get("/getTheListEn", verify ,async (req , res)=>{
    try{
        const response =await featureListEn.findOne({deleteDate:null , _id:req.query.listId});
        res.status(200).send(response);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
    }
});

router.get("/getProductEn" , verify,async (req , res)=>{
    var json = {}
    try{
        var response =await productEn.findOne({deleteDate:null , _id:req.query.id});
        var tempRes = response;
        const whatsAppContact =await waOpratorMEn.findOne({deleteDate:null , _id:response.contactButtons[0]});
        const phoneContact =await opratorMEn.findOne({deleteDate:null , _id:response.contactButtons[1]});
        json.product =response; 
        json.phoneContacts = [whatsAppContact,phoneContact];
        res.status(200).send(json);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});

//delete category
router.post("/deleteFeatureListEn", verify, async (req , res , next)=>{
    if(req.body.deleteTheListId){
        try{
           await featureListEn.findOneAndUpdate({_id:req.body.deleteTheListId} , {deleteDate:Date.now()});
            res.status(200).send("لیست مورد نظر حذف شد");
        }catch(error){
             res.status(403).send("خطا!لیست حذف نشد");
        }
    }
});


router.post("/updateProductEn" , verify ,async (req , res)=>{
    try{
        const result = await productEn.findOneAndUpdate({_id:req.body.productIdToUpdate} 
            , {title:req.body.title,
            price:req.body.price,
            contactButtons:req.body.contactBtn,
            images:req.body.images,
            categories:req.body.categories,
            tags:req.body.tags,
            features:req.body.featureList,
            keyFeatures:req.body.keyFeatures,
            productCode:req.body.productCode,
            availableSurface:req.body.availableSurface,
            updateDate:Date.now(),
            productRiview:req.body.productRiview})
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!محصول ویرایش نشد");
    }
});


//------------************ main web api ************------------

router.get("/getProductForMainEn" ,async (req , res)=>{
    var json = {}
    try{
        var response =await productEn.findOne({deleteDate:null , validation:true , _id:req.query.id});
        var tempRes = response;
        var overalRate = 0;
        var commentsLength = [];

        const comments = await comment.find({validation:true , deleteDate:null , targetPost:req.query.id });
        if(comments.length ===0){
            overalRate = 0;
        }else{
            for(var i = 0 ; comments.length > i ; i++){
                if(comments[i].rate !== null){
                    commentsLength.push(comments[i].rate);
                    overalRate = comments[i].rate + overalRate;
                }
            }
            overalRate = overalRate/commentsLength.length;
        }

        

        const whatsAppContact =await waOpratorMEn.findOne({deleteDate:null , _id:response.contactButtons[0]}).select('firstName , lastName , phoneNumber , _id');
        const phoneContact =await opratorMEn.findOne({deleteDate:null ,  _id:response.contactButtons[1]}).select('firstName , lastName , phoneNumbers , _id');
        json.product =response; 
        json.phoneContacts = [whatsAppContact,phoneContact];
        json.productRate = overalRate;
        res.status(200).send(json);
    }catch(err){
           res.status(500).send("مشکلی رخ داده است");
           console.log(err);
    }
});

module.exports = router;    