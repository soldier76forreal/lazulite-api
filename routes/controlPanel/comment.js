const express = require('express');
const mongoose = require("mongoose");
const userModel = require("../../models/userModel");
const commentModel = require("../../models/commentModel");
const commentReplyModel = require("../../models/commentReplyModel");
const dbConnection = require('../../connections/fa_connection');
const verifyForMain = require("../users/verifyTokenMain");
const verify = require("../users/verifyToken");
const user = dbConnection.model("user" ,userModel);
const comment = dbConnection.model('comment' , commentModel);
const commentReply = dbConnection.model('commentReply' , commentReplyModel);

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

router.post("/newCommentReplyCp" , verify , async(req , res)=>{
    var newComment = new commentReply({
        comment:req.body.comment,
        targetPost:req.body.targetPost,
        replyedTo:req.body.replyedTo,
        author:req.body.author,
        rootComment:req.body.rootComment,
        validation:false
    })
    
    try{
        const result = await newComment.save();
        const theComment = await comment.findOne({_id:req.body.replyedTo});
        if(theComment.replies.length !== 0){
            const updateOriginalComment = await comment.updateOne({_id:req.body.replyedTo} , {$push:{replies:result._id}});
        }else if(theComment.replies.length === 0){
            const updateOriginalComment = await comment.updateOne({_id:req.body.replyedTo} , {$set:{replies:result._id}});
        }
        res.status(200).send(result);
    }catch(error){
        console.log(error)
         res.status(403).send("خطا!دیدگاه ذخیره نشد");
    }
})

router.post("/newCommentReplyToReplyCp" , verify , async(req , res)=>{
    var newComment = new commentReply({
        comment:req.body.comment,
        targetPost:req.body.targetPost,
        replyedTo:req.body.replyedTo,
        author:req.body.author,
        rootComment:req.body.rootComment,
        validation:false
    })
    try{
        const result = await newComment.save();    
        const theComment = await commentReply.findOne({_id:req.body.replyedTo});    
        if(theComment.replies.length !== 0){
            const updateOriginalComment = await commentReply.updateOne({_id:req.body.replyedTo} , {$push:{replies:result._id}});
        }else if(theComment.replies.length === 0){
            const updateOriginalComment = await commentReply.updateOne({_id:req.body.replyedTo} , {$set:{replies:result._id}});
        }
        res.status(200).send(result);
    }catch(error){
        console.log(error)
         res.status(403).send("خطا!دیدگاه ذخیره نشد");
    }
})

router.post("/newCommentReply" , verifyForMain , async(req , res)=>{
    var newComment = new commentReply({
        comment:req.body.comment,
        targetPost:req.body.targetedPost,
        replyedTo:req.body.replyedTo,
        author:req.body.author,
        validation:false
    })
    try{
        const result = await newComment.save();
        const updateOriginalComment = await comment.updateOne({_id:req.body.replyedTo} , {$push:{replies:result._id}});
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

router.post("/deleteCommentReplyCp" , verify  , async (req , res , next)=>{
    try{
        const theReply = await commentReply.findOne({_id:req.body.id});
        const response = await commentReply.updateOne({_id:req.body.id} , {deleteDate:Date.now()});
        await commentReply.updateMany( { _id: { $in : theReply.replies } },
            { $set: { deleteDate: Date.now()}},
            {multi: true})
            var endOfTheLoop = false;
            var nextReply = theReply._id;
            while(endOfTheLoop === false){
                var result = await findOne({replyedTo:nextReply});
                if(result.replies.length !==0){
                    nextReply = result._id;
                    endOfTheLoop = false
                    await commentReply.updateMany( { _id: { $in : result.replies } },
                        { $set: { deleteDate: Date.now()}},
                        {multi: true})
                    
                }else{
                    endOfTheLoop = true;
                    break;
                }
            }
            

       

        const data = response;
        res.status(200).send(data);
     }catch(error){
        res.status(403).send("خطایی رخ داده است!");
     }
    
});

router.post("/commentValidationUpdateReply" , verify  , async (req , res , next)=>{
    if(await commentReply.findOne({_id:req.body.id , validation:true}).exec()){
        try{
            const response = await commentReply.updateOne({_id:req.body.id} , {validation:false , updateDate:Date.now()});
            const data = response;
            res.status(200).send(data);
            
         }catch(error){
              res.status(403).send("خطایی رخ داده است!");
     
         }
    }else{
        try{
            const response = await commentReply.updateOne({_id:req.body.id} , {validation:true , updateDate:Date.now()});
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
            var replys = [];
            var replysTemp2 = [];
            var aUser = await user.findOne({_id:final[i].author , deleteDate:null});
            var replysLength =await commentReply.countDocuments({rootComment:final[i]._id , deleteDate:null });
            var replysTemp =await commentReply.find({rootComment:final[i]._id , deleteDate:null });
              replysTemp2 = replysTemp.sort(function compare(a, b) {
                var dateA = new Date(a.insertDate);
                var dateB = new Date(b.insertDate);
                return dateA - dateB;
              });
              for(var l = 0 ; replysTemp2.length>l ; l++){
                var aUserForReply = await user.findOne({_id:replysTemp2[l].author , deleteDate:null});
                replys.push({replys:replysTemp2[l] , user:aUserForReply});
              }
            comments.push({comment:final[i] , replys:replys , user:aUser , replysLength:replysLength});
        }
        res.status(200).send(JSON.stringify({comments:comments , commentsLength:commentsLength , commentRate:commentRated}));
    }catch(err){
        console.log(err);
        res.status(403).send('خطایی رخ داده است');
    }
})




router.post('/likeComment' , verifyForMain , async(req , res)=>{
    console.log(req.body.author);
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
        }catch(err){
            console.log(err)
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
        }catch(err){
            console.log(err)
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


router.post('/likeCommentReplyCp' , verify , async(req , res)=>{
    if(req.body.targetComment !== undefined){
        try{
            const check = await commentReply.findOne({_id:req.body.targetComment});
            if(check.dislikes.includes(req.body.author)){ 
                const updateDislike = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
                    $pull: {
                        dislikes: req.body.author
                    }
                })
                if(check.likes.includes(req.body.author)){
                    const updateLikes = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()
                    })
                    
                }else if(!check.likes.includes(req.body.author)){
                    const updateLikes = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }else{
                if(check.likes.includes(req.body.author)){
                    const updateLikes = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            likes: req.body.author
                        },
                        updateDate:Date.now()
                    })
                    
                }else if(!check.likes.includes(req.body.author)){
                    const updateLikes = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
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

router.post('/dislikeCommentReplyCp'  ,verify , async(req , res)=>{
    if(req.body.targetComment !== undefined){
        try{
            const check = await commentReply.findOne({_id:req.body.targetComment});
            if(check.likes.includes(req.body.author)){ 
                const updateLikes = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
                    $pull: {
                        likes: req.body.author
                    }
                })
                if(check.dislikes.includes(req.body.author)){

                    const updateDislike = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                    
                }else if(!check.dislikes.includes(req.body.author)){
                    const updateDislike = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
                        $push: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                }
            }else{
                if(check.dislikes.includes(req.body.author)){

                    const updateDislike = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
                        $pull: {
                            dislikes: req.body.author
                        },
                        updateDate:Date.now()

                    })
                    
                }else if(!check.dislikes.includes(req.body.author)){
                    const updateDislike = await commentReply.findOneAndUpdate({_id:req.body.targetComment} , {
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