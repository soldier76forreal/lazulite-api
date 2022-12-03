const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const liveGallerySchema = new mongoose.Schema ({
    author : {type: mongoose.Schema.Types.ObjectId , require:true },
    insertDate : {type:Date , default:Date.now},
    photos : [{ type: mongoose.Schema.Types.ObjectId , require:true}],
    targtedPost : {type: mongoose.Schema.Types.ObjectId , require:true },
    updateDate : {type:Date , default:null},
    deleteDate : {type:Date , default:null},
    validation : {type : Array }
});
module.exports = liveGallerySchema;