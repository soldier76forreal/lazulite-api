const mongoose = require('mongoose');

// var moment = require('jalali-moment');

const productSchema = new mongoose.Schema ({
    author : {type : String , require:true},
    title:{type:String , required:true},
    productCode:{type:String , required:true},
    availableSurface:{type:Number , required:true},
    price:{type:Object , required:true},
    contactButtons : [{ type: mongoose.Schema.Types.ObjectId , required:true }],
    images : {type:Array , required:true},
    features : {type:Array , required:true},
    productRiview:{type:String , required:true},
    keyFeatures : {type:Array , required:true},
    categories : [{ type: mongoose.Schema.Types.ObjectId , required:true }],
    tags : [{ type: mongoose.Schema.Types.ObjectId , required:true }],
    insertDate : {type:Date , default:Date.now},
    validation : {type : Boolean , default:false },
    stock: {type:Boolean , default:true},
    pageTitle:{type:String},
    pageDescription:{type:String},
    updateDate : {type:Date , default:null },
    deleteDate : {type:Date , default:null }
    // date : {type:Date , default:moment().locale('fa').format('YYYY/M/D')}
});
module.exports = productSchema;