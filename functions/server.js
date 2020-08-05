const { MongoClient } = require("mongodb")

require("mongodb").MongoClient
const dotenv = require('dotenv').config()
const dbUrl = process.env.DB_URL,
dbOptions = {
useNewUrlParser: true,
useUnifiedTopology: true
}
connectToDB=function(){
    const db = MongoClient.connect(dbUrl, dbOptions)
    return db;
}