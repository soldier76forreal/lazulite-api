const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const commentReply = new mongoose.Schema ({
    comment : {type : String , require:true },
    author : {type: mongoose.Schema.Types.ObjectId , required:true },
    likes : {type : Array},
    dislikes : {type : Array},
    rootComment:{type: mongoose.Schema.Types.ObjectId , required:true},
    targetPost : {type: mongoose.Schema.Types.ObjectId , required:true},
    replies :[{ type: mongoose.Schema.Types.ObjectId }],
    replyedTo:{type: mongoose.Schema.Types.ObjectId , required:true },
    validation : {type : Boolean ,  required:true}, 
    insertDate : {type:Date , default:Date.now},
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null }
});

module.exports = commentReply;
