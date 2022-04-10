const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const categorySchema = new mongoose.Schema ({
    category : {type : String , require:true , unique:true },
    author : {type: mongoose.Schema.Types.ObjectId , require:true },
    insertDate : {type:Date , default:Date.now},
    tagsId : [{ type: mongoose.Schema.Types.ObjectId }],
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null },
    validation : {type : Boolean , default:false }
}); 
module.exports = categorySchema;