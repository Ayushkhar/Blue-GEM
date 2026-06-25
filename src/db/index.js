// This is the proffesional approach 
import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";



const connectDB = async() => {
    try 
    {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`/n Mongo db connected ## ${connectioninstance.connection.host}`);
    }catch(error){
        console.log("ERROR",error);
        process.exit(1)
    }
}

export default connectDB