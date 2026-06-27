import { asyncHandler } from "../utils/asyncHandler.js"
import { Apierror } from "../utils/Apierror.js";
import {USER} from "../models/user.model.js"
import {UploadonCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshTokens } from "../../genaccessrefreshtkn.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res)=>{
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
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUSER = await USER.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUSER){
        throw new Apierror(500, "Something went wrong while registering")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUSER, "USER registered successfully")
    )
})
const loginuser = asyncHandler(async (req,res) => {
    // req body se data lao 
    // username or Email
    // find the user
    // password check if wrong(re-enter)
    // password correct => access and refresh tokens
    // send cookies 
    const {email, username, password} = req.body;
    if (!username && !email) {
        throw new Apierror(400, "Username or email is required");
    }
    if (!password) {
        throw new Apierror(400, "Password is required");
    }
    const user = await USER.findOne({
        $or: [{username}, {email}]
    })
    if(!user)
    {
        throw new Apierror(400, "username not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid)
    {
        throw new Apierror(401, "Password incorrect");
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await USER.findById(user._id).select("-password -refreshToken");
    // This is for cookie 
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully",

        )
    )

})
const logoutuser = asyncHandler(async (req, res) => {
    await USER.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const refreshAccesstoken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new Apierror(401, "Unauthorised access");

    }
    // verify
    try {
        const decoedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await USER.findById(decodedToken?._id);
        if(!user){
            throw new Apierror(401, "Invalid refresh token");
    
        }
        if(incomingRefreshToken != user?.refreshToken){
            throw new Apierror(401,"Ref token expired");
        }
        const options = {
            httpOnly: true,
            secure: true
        };
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id);
        return res
            .status(200)
            .clearCookie("accessToken", accessToken, options)
            .clearCookie("refreshToken", newrefreshToken, options)
            .json(new ApiResponse(200, {accessToken, newrefreshToken}, "Tokens refreshed"));
    } catch (error) {
        throw new Apierror(401,error?.message || "Invalid refresh Token");  
    }
});


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body
    const user = await USER.findById(req.user?.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect)
    {
        throw new Apierror(400,"Invalid old password");
    }
    user.password = newPassword
    user.save({validateBeforeSave: false});

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfuly"));  
});

const getCurrentPassword = asyncHandler(async (req,res)=>{
    return res.status(200).json(200, req.user, "Current user fetched");
});

const updateAccountDetails = asyncHandler(async (req,res) =>{
    const {fullname, email} = req.body

    if(!fullname || !email)
    {
        throw new Apierror(400,"All fields are neccessary");

    }
    const user = USER.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                fullname: fullname,
                email: email
            },
        },
        {new: true} // This will return the new info as well 
    ).select("-password");
    return res.status(200).json(new Apiresponse(200,user,"Account details upated successfully"));
});

const updateuserAvtar = asyncHandler(async (req,res)=>{
        const avatarLocalPath = req.files?.path;
        if(!avatarLocalPath)
        {
            throw new Apierror(400, "Avatar file is missing");

        }
        const avtar = await UploadonCloudinary(avatarLocalPath);
        if(!avatar.url)
        {
            throw new Apierror(400, "Please upload new Avatar");

        }
        const user = await USER.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url
                }
            },
            {new: true}
        )
    return res.status(200).json(200, new ApiResponse(200,user,"Avatar image updated"));


})
const updateuserCover = asyncHandler(async (req,res)=>{
        const coverLocalPath = req.files?.path;
        if(!coverLocalPath)
        {
            throw new Apierror(400, "Avatar file is missing");

        }
        const coverimg = await UploadonCloudinary(coverLocalPath);
        if(!coverimg.url)
        {
            throw new Apierror(400, "Please upload new cover image");

        }
        const user = await USER.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    coverImage: coverimg.url
                }
            },
            {new: true}
        ).select("-password");
        return res.status(200).json(200, new ApiResponse(200,user,"cover image updated"));
})


export {registerUser, loginuser, logoutuser, refreshAccesstoken, changeCurrentPassword
    , getCurrentPassword, updateAccountDetails, updateuserAvtar
,updateuserCover};