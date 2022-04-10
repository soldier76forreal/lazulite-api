const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const featureListSchema = new mongoose.Schema ({
    // author : {type : String , require:true },
    listName:{type:String , required:true},
    insertDate : {type:Date , default:Date.now},
    featureList : {type:Array , required:true},
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null }
}); 
module.exports = featureListSchema;