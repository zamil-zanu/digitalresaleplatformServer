const mongoose=require('mongoose')
require('dotenv').config()  // Load environment variables
const connection_string=process.env.MONGO_URI
mongoose.connect(connection_string).then(res=>{
    console.log("MongoDB is connected to Server");
}).catch(err=>{
    console.log("MongoDB connection failed");
    console.log(err);
})