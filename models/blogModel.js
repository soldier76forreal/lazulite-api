const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const blogSchema = new mongoose.Schema ({
    title : {type : String , require:true },
    subtitle : {type : String , require:true },
    author : {type: mongoose.Schema.Types.ObjectId , require:true },
    insertDate : {type:Date , default:Date.now},
    updateDate : {type:Date , default:null},
    deleteDate : {type:Date , default:null},
    content : {type:String , require:true },
    coverImage : {type:String , required:true},
    source:{type:String},
    pageTitle:{type:String},
    pageDescription:{type:String},
    validation : {type : Boolean , default:false }
});
module.exports = blogSchema;