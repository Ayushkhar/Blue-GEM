import mongoose from "mongoose";
import express from "express";
import dns from "node:dns";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from "dotenv";


dotenv.config({
    path: './.env'
})
connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR: ",error)
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`App is running on port no: ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("MONGO DB connection ERROR",error);
})





// const app = express()

// (async() => {
//     try
//     {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
//         app.on("error",(error)=>{
//             console.log("ERROR: ",error);
//             throw error;
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port number: ${process.env.PORT}`);

//         })
//     }catch(error){
//         console.log("ERROR occured: ",error);
//         throw error;
//     }
// })()
