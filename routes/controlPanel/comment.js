const express = require('express');
const mongoose = require("mongoose");
const userModel = require("../../models/userModel");
const commentModel = require("../../models/commentModel");
const dbConnection = require('../../connections/fa_connection');
const verifyForMain = require("../users/verifyTokenMain");
const verify = require("../users/verifyToken");
const user = dbConnection.model("user" ,userModel);
const comment = dbConnection.model('comment' , commentModel);

const router = express.Router()


router.post("/newComment" , verifyForMain , async(req , res)=>{
    const checkIfUserRated = await comment.find({validation:true ,author:req.query.author , deleteDate:null , rate:!null});

    if(checkIfUserRated.length === 0){
        var newComment = new comment({
            comment:req.body.comment,
            targetPost:req.body.targetedPost,
            author:req.body.author,
            validation:false,
            rate:req.body.rate
        })
    }else if(checkIfUserRated.length !== 0){
        var newComment = new comment({
            comment:req.body.comment,
            targetPost:req.body.targetedPost,
            author:req.body.author,
            validation:false,
            rate:null
        })
    }
    try{
        const result = await newComment.save();
        res.status(200).send(result);
    }catch(error){
         res.status(403).send("خطا!دیدگاه ذخیره نشد");
    }
})

router.get('/getComments' , async(req , res)=>{
    var comments = [];
    var response = [];
    var temp = []
    var commentRated = 0;
    var ratedComment = [];
   
    try{
        const commentsLength = await comment.countDocuments({validation:true ,targetPost:req.query.id , deleteDate:null});
        const commentRate = await comment.find({validation:true ,targetPost:req.query.id , deleteDate:null});
        for(var l = 0; commentRate.length > l ; l++){
            if(commentRate[l].rate !== null){
                commentRated = commentRate[l].rate + commentRated;
                ratedComment.push(commentRate[l]);
            }
        }
        commentRated = commentRated/ratedComment.length;
        
        response = await comment.find({validation:true ,targetPost:req.query.id , deleteDate:null});
        response.reverse();
        for(j = 0 ; parseInt(req.query.limit) > j ; j++ ){
            if(response[j] !== undefined){
                temp.push(response[j]);
            }
        }
        for(var i = 0 ; temp.length > i ; i++){
            var aUser = await user.findOne({validation:true , _id:temp[i].author , deleteDate:null});
            comments.push({comment:temp[i] , user:aUser});
        }
        var ratedByThisUser = {rated : false , rate:0};

        if(req.query.logedInId){

            const ratedOrNotReq = await comment.find({validation:true , deleteDate:null , author:req.query.logedInId , targetPost:req.query.id});
            if(ratedOrNotReq.length !== 0){
                for(var m = 0 ; ratedOrNotReq.length > m ; m++){
                    if(ratedOrNotReq[m].rate !==null){
                        ratedByThisUser.rated = true;
                        ratedByThisUser.rate = ratedOrNotReq[m].rate;

                        break;
                    }
                }
            }else{
                ratedByThisUser.rated = false;
            }            
        }

        res.status(200).send(JSON.stringify({comments:comments , commentsLength:commentsLength , commentRate:commentRated , ratedOrNot:ratedByThisUser}));
    }catch{
        res.status(403).send('خطایی رخ داده است');
    }
})

router.post("/commentValidationUpdate" , verify  , async (req , res , next)=>{
    if(await comment.findOne({_id:req.body.id , validation:true}).exec()){
        try{
            const response = await comment.updateOne({_id:req.body.id} , {validation:false , updateDate:Date.now()});
            const data = response;
            res.status(200).send(data);
            
         }catch(error){
              res.status(403).send("خطایی رخ داده است!");
     
         }
    }else{
        try{
            const response = await comment.updateOne({_id:req.body.id} , {validation:true , updateDate:Date.now()});
            const data = response;
            res.status(200).send(data);
            
         }catch(error){
             console.log(error);
              res.status(403).send("خطایی رخ داده است!");
         }
    }
    
});

router.post("/deleteCommentCp" , verify  , async (req , res , next)=>{
    try{
        const response = await comment.updateOne({_id:req.body.id} , {deleteDate:Date.now()});
        const data = response;
        res.status(200).send(data);
     }catch(error){
        res.status(403).send("خطایی رخ داده است!");
     }
    
});
router.get('/getCommentsForCp' , verify , async(req , res)=>{
    console.log("svsvs");
    var comments = [];
    var response = [];
    var temp = [];
    var final = [];
    var commentRated = 0;
    var ratedComment = [];
    try{
        const commentsLength = await comment.countDocuments({ deleteDate:null});
        const commentRate = await comment.find({ deleteDate:null});
        for(var l = 0; commentRate.length > l ; l++){
            if(commentRate[l].rate !== null){
                commentRated = commentRate[l].rate + commentRated;
                ratedComment.push(commentRate[l]);
            }
        }
        commentRated = commentRated/ratedComment.length;
        response = await comment.find({deleteDate:null});
        if(req.query.filter === 'last'){
            temp = response.sort(function compare(a, b) {
                var dateA = new Date(a.insertDate);
                var dateB = new Date(b.insertDate);
                return dateA - dateB;
              });
              temp.reverse();
        }else if(req.query.filter === 'old'){
            temp = response.sort(function compare(a, b) {
                var dateA = new Date(a.insertDate);
                var dateB = new Date(b.insertDate);
                return dateA - dateB;
              });
        }else if(req.query.filter === 'notValid'){
            temp = [];
            for(var p = 0 ; response.length > p ; p++){
                if(response[p].validation === false){
                    temp.push(response[p]);
                }
            }
            for(var k = 0 ; response.length > k ; k++){
                if(response[k].validation === true){
                    temp.push(response[k]);
                }
            }
        }else if(req.query.filter === 'valid'){
            temp = [];
            for(var p = 0 ; response.length > p ; p++){
                if(response[p].validation === true){
                    temp.push(response[p]);
                }
            }
            for(var k = 0 ; response.length > k ; k++){
                if(response[k].validation === false){
                    temp.push(response[k]);
                }
            }
        }else{
            temp = [...response];
            temp.reverse();

        }
        
        for(j = 0 ; parseInt(req.query.limit) > j ; j++ ){
            if(temp[j] !== undefined){
                final.push(temp[j]);
            }
        }
        for(var i = 0 ; final.length > i ; i++){
            var aUser = await user.findOne({_id:final[i].author , deleteDate:null});
            comments.push({comment:final[i] , user:aUser});
        }
        res.status(200).send(JSON.stringify({comments:comments , commentsLength:commentsLength , commentRate:commentRated}));
    }catch(err){
        console.log(err);
        res.status(403).send('خطایی رخ داده است');
    }
})


router.post('/likeComment' , verifyForMain , async(req , res)=>{
    if(req.body.targetComment !== undefined){
        try{
            const check = await comment.findOne({_id:req.body.targetComment});
            if(check.dislikes.includes(req.body.author)){ 
                const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                    $pull: {
                        dislikes: req.body.author
                    }
                })
                if(check.likes.includes(req.body.author)){
                    const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()
                    })
                    
                }else if(!check.likes.includes(req.body.author)){
                    const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }else{
                if(check.likes.includes(req.body.author)){
                    const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()
                    })
                    
                }else if(!check.likes.includes(req.body.author)){
                    const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }
            res.status(200).send('ok');
        }catch{
            res.status(403).send('خطایی رخ داده است');
        }
    }

})

router.post('/dislikeComment'  ,verifyForMain , async(req , res)=>{
    if(req.body.targetComment !== undefined){
        try{
            const check = await comment.findOne({_id:req.body.targetComment});
            if(check.likes.includes(req.body.author)){ 
                const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                    $pull: {
                        likes: req.body.author
                    }
                })
                if(check.dislikes.includes(req.body.author)){
                    console.log('tdac')
                    const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                    
                }else if(!check.dislikes.includes(req.body.author)){
                    const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }else{
                if(check.dislikes.includes(req.body.author)){
                    console.log('tdac')
                    const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                    
                }else if(!check.dislikes.includes(req.body.author)){
                    const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }
            res.status(200).send('ok');
        }catch{
            res.status(403).send('خطایی رخ داده است');
        }
    }

})



router.post('/likeCommentCp' , verify , async(req , res)=>{
    if(req.body.targetComment !== undefined){
        try{
            const check = await comment.findOne({_id:req.body.targetComment});
            if(check.dislikes.includes(req.body.author)){ 
                const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                    $pull: {
                        dislikes: req.body.author
                    }
                })
                if(check.likes.includes(req.body.author)){
                    const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()
                    })
                    
                }else if(!check.likes.includes(req.body.author)){
                    const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }else{
                if(check.likes.includes(req.body.author)){
                    const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()
                    })
                    
                }else if(!check.likes.includes(req.body.author)){
                    const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }
            res.status(200).send('ok');
        }catch{
            res.status(403).send('خطایی رخ داده است');
        }
    }

})

router.post('/dislikeCommentCp'  ,verify , async(req , res)=>{
    if(req.body.targetComment !== undefined){
        try{
            const check = await comment.findOne({_id:req.body.targetComment});
            if(check.likes.includes(req.body.author)){ 
                const updateLikes = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                    $pull: {
                        likes: req.body.author
                    }
                })
                if(check.dislikes.includes(req.body.author)){
                    console.log('tdac')
                    const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                    
                }else if(!check.dislikes.includes(req.body.author)){
                    const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }else{
                if(check.dislikes.includes(req.body.author)){
                    console.log('tdac')
                    const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                    
                }else if(!check.dislikes.includes(req.body.author)){
                    const updateDislike = await comment.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }
            res.status(200).send('ok');
        }catch{
            res.status(403).send('خطایی رخ داده است');
        }
    }

})

module.exports = router;     