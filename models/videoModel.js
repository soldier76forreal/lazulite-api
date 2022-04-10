const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const videoSchema = new mongoose.Schema ({
    author : {type: mongoose.Schema.Types.ObjectId  , require:true },
    videoName:{type:String , required:true},
    insertDate : {type:Date , default:Date.now},
    metaData : {type:Object , required:true},
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null }
}); 
module.exports = videoSchema;