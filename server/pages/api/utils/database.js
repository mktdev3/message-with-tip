import mongoose from "mongoose";
import * as dotenv from 'dotenv';

const connectDB = async() => {
    try{
        mongoose.connect(`mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.5tijt9t.mongodb.net/?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: false
        })
        console.log("Success: Connected to MongoDB")
    }catch(err){
        console.log("Failure: Unconnected to MongoDB")
        //throw new Error()
    }
}

export default connectDB;