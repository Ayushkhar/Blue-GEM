import { asyncHandler } from "../utils/asyncHandler.js"
import { Apierror } from "../utils/Apierror.js";
import {USER} from "../models/user.model.js"
import {UploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res)=>{
    console.log("req.body:", req.body)      
    console.log("req.files:", req.files)
    // get users details from frontend 
    // validation - not empty 
    // check if user already exists: username, email 
    // check for images, check for avatar 
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token field 
    // check for user creation 
    // return res
    const {fullname, email, username, password} = req.body
    console.log("Email: ",email);
    if(fullname === "") {
        throw new Apierror(400,"fullname is required")
    }
    if(password === "") {
        throw new Apierror(400,"password is required")
    }
    if(email === "") {
        throw new Apierror(400,"email is required")
    }
    if(username === "") {
        throw new Apierror(400,"username is required")
    }
    const existedUser = await USER.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new Apierror(409, "User alredy exists");
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path
    if(!avatarLocalPath) {
        throw new Apierror(400,"Avatar file is causing error");
    }

    const avatar = await UploadonCloudinary(avatarLocalPath);
    const coverImage = await UploadonCloudinary(coverLocalPath);
    if(!avatar || !coverImage){
        throw new Apierror(400,"Files not found");
    }

    const user = await USER.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage,
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUSER = await USER.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUSER){
        throw new Apiuser(500, "Something went wrong while registering")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUSER, "USER registered successfully")
    )

})


export {registerUser};