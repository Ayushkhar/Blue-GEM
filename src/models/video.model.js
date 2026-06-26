import mongoose, { Types } from "mongoose";
import mongooseAggregatePaginate from "mongooseAggregatePaginate";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String, //Cloudinary 
            required: true,
        },
        thumbnail: {
            type: String,
            required: true, 
        },
        title: {
            type: String,
            required: true, 
        },
        description: {
            type: String,
            required: true, 
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "USER"
        }
    },{timestamps: true}
);




export const VIDEO = mongoose.model('VIDEO',videoSchema);