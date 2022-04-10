const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const tagSchema = new mongoose.Schema ({
    tag : {type : String , require:true , unique:true },
    author : {type: mongoose.Schema.Types.ObjectId , require:true },
    insertDate : {type:Date , default:Date.now},
    categoriesId : [{ type: mongoose.Schema.Types.ObjectId }],
    updateDate : {type:Date , default:null},
    deleteDate : {type:Date , default:null},
    validation : {type : Array }
});
module.exports = tagSchema;