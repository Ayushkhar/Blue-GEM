import mongoose from "mongoose";


const subscriptionschema = mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER"
    },
    
},{timestamps: true});

export const Subscription=  mongoose.model("Subscription",subscriptionschema)