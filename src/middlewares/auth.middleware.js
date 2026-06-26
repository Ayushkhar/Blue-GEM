import { Apierror } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { USER } from "../models/user.model.js";

const verifyJWT = asyncHandler(async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token)
        {
            throw new Apierror(401, "Unauthorised access");
        }
    
        const decoedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user =  await USER.findById(decoedToken?._id).
        select("-password -refreshToken");
    
        if(!user)
        {
            throw new Apierror(401, "Invali Access Token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new Apierror(401, "Invalid Access Token");
    }
})
export {verifyJWT};
