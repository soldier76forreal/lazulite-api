const express = require('express');
const mongoose = require("mongoose");
const tagModel = require("../../models/tagModel");
const multer = require('multer');
const courseModel = require("../../models/courseModel");
const {commentModel} = require('../../models/commentModel');
const bcrypt = require("bcryptjs");
const {replyModel} = require('../../models/commentModel');
const userModel = require('../../models/userModel');
const jwt = require('jsonwebtoken'); 
const dbConnection = require('../../connections/fa_connection');

const router = express.Router()

let refreshTokens = [];
let refreshTokensForMain = [];

const userM = dbConnection.model("user" ,userModel);

//VALIDATION

const joi = require("joi");
const schema =joi.object({
    firstName : joi.string().min(1).required(),
    lastName : joi.string().min(1).required(),
    email : joi.string().min(6).required().email().error(errors => {
        errors.forEach(err => {
          switch (err.code) {
            case "any.empty":
              err.message = "ایمیل را وارد کنید";
              break;
            case "string.min":
              err.message = `ایمیل معتبر نیست`;
              break;
            case "string.email":
              err.message = `ایمیل معتبر نیست`;
              break;
            default:"ایمیل معتبر نیست"
              break;
          }
        });
        return errors;
      }),
    password : joi.string().regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*/).min(8).required().error(errors => {
        errors.forEach(err => {
          switch (err.code) {
            case "any.empty":
                err.message = "کلمه عبور معتبر نیست";
                break;
            case "string.pattern.base":
                err.message = "کلمه عبور باید دارای حروف بزرگ و عدد باشد";
                break;
            case "string.min":
                err.message = `رمز عبور باید حداقل ${err.local.limit} کاراکتر باشد`; 
            default:"ایمیل معتبر نیست"
              break;
          }
        });
        return errors;
      })

})


const loginSchema = joi.object({
  email : joi.string().min(6).required().email().error(errors => {
    errors.forEach(err => {
      switch (err.code) {
        case "any.empty":
          err.message = "ایمیل معتبر نیست";
          break;
        case "string.min":
          err.message = `ایمیل معتبر نیست`;
          break;
        case "string.email":
          err.message = `ایمیل معتبر نیست`;
          break;
        default:"ایمیل معتبر نیست"
          break;
      }
    });
    return errors;
  })
})




//auth routes
router.post("/register" , async(req,res)=>{
    // validate infor before sending to data base
    
    const error =  schema.validate(req.body);
    if(error.error){
       res.status(400).send(error.error.details[0].message);
    }else{
            const existEmail = await userM.findOne({email:req.body.email});
            if(existEmail){
                res.status(400).send("ایمیل تکراری است");
            }else{
                  
                
                //hash password
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(req.body.password , salt);
                const newUser = new userM({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : req.body.email,
                    password : hashPassword,
                    validation : false,
                    role: "user"
                })
            
                try{
                    const saveUser = await newUser.save();
                    const user = await userM.findOne({email:req.body.email});
                    //check if password is correct
                    const validPassword = await bcrypt.compare(req.body.password , user.password);
                    //creat and assign a token
                    if(user.role === 'superAdmin' && user.validation === true){
                    const token = jwt.sign
                    ({id:user._id , firstName:user.firstName , lastName:user.lastName , role:user.role }, process.env.TOKEN_SECRET);
                    res.header("auth_token" , token ).send({token:token , msg:'ثبت نام انجام شد'});
                  }else{
                    res.status(401).send("عدم دسترسی");
                  }
                }catch(err){
                    res.status(400).send(err);
                    
                }
          }
    }
})

router.post("/registerMainPage" , async(req,res , next)=>{
  // validate infor before sending to data base
  const error =  schema.validate(req.body);
  if(error.error){
     res.status(400).send(error.error.details[0].message);
     next()
  }else{
              const existEmail = await userM.findOne({email:req.body.email});
            if(existEmail){
                res.status(400).send("ایمیل تکراری است");
                res.end();
                next()
            }else{
              //hash password
              const salt = await bcrypt.genSalt(10);
              const hashPassword = await bcrypt.hash(req.body.password , salt);
              const newUser = new userM({
                  firstName : req.body.firstName,
                  lastName : req.body.lastName,
                  email : req.body.email,
                  password : hashPassword,
                  validation : true,
                  role: "user"
              })
          
              try{
                  const saveUser = await newUser.save();
                  const user = await userM.findOne({email:req.body.email});
                  //check if password is correct
                  const validPassword = await bcrypt.compare(req.body.password , user.password);
                  //creat and assign a token
                  if(user.role === 'user' && user.validation === true){
                    if(req.body.email !== '' && req.body.password !== ''){
                      const user = await userM.findOne({email:req.body.email});
                      if(!user){
                          res.status(400).send("ایمیل یا کلمه عبور اشتباه است");
                          res.end();
                          next()
                      }else{
                              //check if password is correct
                          const validPassword = await bcrypt.compare(req.body.password , user.password);
                          if(!validPassword) {
                              res.status(400).send("ایمیل یا کلمه عبور اشتباه است");
                              res.end();
                              next()
                          }else{
                            if(user.role === 'user' || user.role === 'admin' || user.role === 'superAdmin' && user.validation === true){
                              //creat and assign a token
                              let accessToken = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRETFORMAIN , {expiresIn : '3m'} );
                              let refreshToken = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRET_REFFORMAIN , {expiresIn : '6h'});
                              refreshTokensForMain.push(refreshToken);
                              return res.status(200).cookie('refreshToken' , refreshToken , {
                                sameSite:'strict',
                                path:'/',
                                secure:true,
                                expires:new Date(new Date().getTime() + process.env.EXPIRE_TOKEN),
                                httpOnly:true
                              }).send({
                                accessToken
                              })
                              res.end();

                              next()

                              // const token = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRET);
                              // res.header("auth_token" , token ).send(token);
                              }else{
                                res.status(401).send("خطا!");
                                res.end();

                                next()

                              }
                          }
                      }
                  }else{
                    res.status(400).send("ایمیل یا کلمه عبورو وارد نکردید");
                    next()
                  }
                }else{
                  res.status(401).send("عدم دسترسی");
                    next()
                }
              }catch(err){
                  res.status(400).send(err);
                  console.log(err)
                  
              }
          }
  }
})

router.post("/login" , async(req,res)=>{
    //check if email is correct
  if(req.body.email !== '' && req.body.password !== ''){
      const user = await userM.findOne({email:req.body.email});
      if(!user){
          res.status(400).send("ایمیل یا کلمه عبور اشتباه است");
      }else{
              //check if password is correct
          const validPassword = await bcrypt.compare(req.body.password , user.password);
          if(!validPassword) {
              res.status(400).send("ایمیل یا کلمه عبور اشتباه است");
          }else{
            if(user.role === 'admin' || user.role === 'superAdmin' && user.validation === true){
              //creat and assign a token
              let accessToken = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRET , {expiresIn : '3m'} );
              let refreshToken = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRET_REF , {expiresIn : '6h'});
              refreshTokens.push(refreshToken);
              return res.status(200).cookie('refreshToken' , refreshToken , {
                sameSite:'strict',
                path:'/',
                secure:true,
                expires:new Date(new Date().getTime() + process.env.EXPIRE_TOKEN),
                httpOnly:true
              }).send({
                accessToken
              })
              // const token = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRET);
              // res.header("auth_token" , token ).send(token);
              }else{
                res.status(401).send("عدم دسترسی");
              }
          }
      }


  }else{
    res.status(400).send("ایمیل یا کلمه عبورو وارد نکردید");

  }
})

router.post("/loginForMain" , async(req,res)=>{
  //check if email is correct
if(req.body.email !== '' && req.body.password !== ''){
    const user = await userM.findOne({email:req.body.email});
    if(!user){
        res.status(400).send("ایمیل یا کلمه عبور اشتباه است");
    }else{
            //check if password is correct
        const validPassword = await bcrypt.compare(req.body.password , user.password);
        if(!validPassword) {
            res.status(400).send("ایمیل یا کلمه عبور اشتباه است");
        }else{
          if(user.role === 'user' , user.role === 'admin' || user.role === 'superAdmin' && user.validation === true){
            //creat and assign a token
            let accessToken = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRETFORMAIN , {expiresIn : '10s'} );
            let refreshToken = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRET_REFFORMAIN , {expiresIn : '6h'});
            refreshTokensForMain.push(refreshToken);
            return res.status(200).cookie('refreshToken' , refreshToken , {
              sameSite:'strict',
              path:'/',
              secure:true,
              expires:new Date(new Date().getTime() + process.env.EXPIRE_TOKEN),
              httpOnly:true
            }).send({
              accessToken
            })
            // const token = jwt.sign({id:user._id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} , process.env.TOKEN_SECRET);
            // res.header("auth_token" , token ).send(token);
            }else{
              res.status(401).send("عدم دسترسی");
            }
        }
    }
}else{
  res.status(400).send("ایمیل یا کلمه عبورو وارد نکردید");
}
})


router.post('/refreshToken' , (req , res)=>{
  if(!req.cookies.refreshToken || !refreshTokens.includes(req.cookies.refreshToken)){
    return res.status(401).send('در دسترس نیست');
 }else{ 
        jwt.verify(req.cookies.refreshToken , process.env.TOKEN_SECRET_REF , (error ,user) =>{
          if(!error){ 
            const accessToken = jwt.sign({id:user.id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} ,process.env.TOKEN_SECRET ,{expiresIn:'3m'});
            return res.status(200).send({accessToken:accessToken});
          }else{
            return res.status(401).send('در دسترس نیست');
          }
        });     
 }

});

router.post('/refreshTokenForMain' , (req , res)=>{
  if(!req.cookies.refreshToken || !refreshTokensForMain.includes(req.cookies.refreshToken)){
    return res.status(401).send('در دسترس نیست');
 }else{ 
        jwt.verify(req.cookies.refreshToken , process.env.TOKEN_SECRET_REFFORMAIN , (error ,user) =>{
          if(!error){ 
            const accessToken = jwt.sign({id:user.id , firstName:user.firstName , profileImage:user.profileImage , lastName:user.lastName , role:user.role} ,process.env.TOKEN_SECRETFORMAIN ,{expiresIn:'3m'});
            return res.status(200).send({accessToken:accessToken});
          }else{
            return res.status(401).send('در دسترس نیست');
          }
        });     
 }

});

router.post('/deleteRefreshToken' , (req , res)=>{
  res.status(200).clearCookie('refreshToken').send("refresh cookie cleared!");

});

module.exports = router;