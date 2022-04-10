const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const courseSchema = new mongoose.Schema ({
    courseContent : {type : String , require:true },
    // author : {type : String , require:true },
    courseTitle : {type : String , required:true},
    tags : {type : Array , required:true},
    shared : {type : Array},
    validation : {type : Boolean ,  required:true}, 
    date : {type:Date , default:Date.now},
    imageCover : {type:Object , required:true},
    view : {type:Number},
    updated_at : {type:Date},
    deleted_at:{type:Date , default:null} 
    // date : {type:Date , default:moment().locale('fa').format('YYYY/M/D')}
});
const course = mongoose.model("courses" ,courseSchema );
module.exports = course;