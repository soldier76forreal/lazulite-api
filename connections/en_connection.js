const mongoose = require("mongoose");

const dbConnection_en = mongoose.createConnection(process.env.DB_CONNECTEn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
});


module.exports = dbConnection_en;