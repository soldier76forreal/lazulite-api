const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const imagesSchema = new mongoose.Schema ({
    author : {type: mongoose.Schema.Types.ObjectId  , require:true },
    imageName:{type:Object , required:true},
    insertDate : {type:Date , default:Date.now},
    title:{type:String},
    metaData : {type:Object , required:true},
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null }
}); 
module.exports = imagesSchema;