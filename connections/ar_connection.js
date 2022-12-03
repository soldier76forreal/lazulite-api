const mongoose = require("mongoose");

const dbConnection_ar = mongoose.createConnection(process.env.DB_CONNECTAr, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
});
module.exports = dbConnection_ar;