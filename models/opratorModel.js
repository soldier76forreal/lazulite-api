const mongoose = require('mongoose');
// var moment = require('jalali-moment');

const opratorSchema = new mongoose.Schema ({
    author : {type: mongoose.Schema.Types.ObjectId , require:true },
    firstName:{type:String , required:true},
    lastName:{type:String , required:true},
    phoneNumbers : {type:Array , required:true},
    contactRequest : {type:Array},
    insertDate : {type:Date , default:Date.now},
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null }
    // date : {type:Date , default:moment().locale('fa').format('YYYY/M/D')}
});

const whatsAppSchema = new mongoose.Schema ({
    author : {type: mongoose.Schema.Types.ObjectId , require:true },
    firstName:{type:String , required:true},
    lastName:{type:String , required:true},
    phoneNumber : {type:String , required:true},
    insertDate : {type:Date , default:Date.now},
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null }
    // date : {type:Date , default:moment().locale('fa').format('YYYY/M/D')}
});
module.exports = {
    opratorModel: opratorSchema,
    whatsAppOpratorModel: whatsAppSchema
  } 