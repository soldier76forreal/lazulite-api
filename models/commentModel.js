const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const commentSchema = new mongoose.Schema ({
    comment : {type : String , require:true },
    author : {type: mongoose.Schema.Types.ObjectId , required:true },
    likes : {type : Array},
    rate: {type:Number},
    dislikes : {type : Array},
    targetPost : {type: mongoose.Schema.Types.ObjectId , required:true},
    replies :[{ type: mongoose.Schema.Types.ObjectId }],
    validation : {type : Boolean ,  required:true}, 
    insertDate : {type:Date , default:Date.now},
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null }
});

module.exports = commentSchema;
