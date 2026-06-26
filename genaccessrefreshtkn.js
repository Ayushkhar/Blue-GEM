import { Apierror } from "./src/utils/Apierror.js"
import { USER } from "./src/models/user.model.js"
const generateAccessAndRefreshTokens = async (userId)=>
{
    try
    {
        const user = await USER.findById(userId);

        const accessToken = await user.generateaccesstoken(); 
        const refreshToken = await user.generaterefreshtoken(); 

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    }catch(error)
    {
        throw new Apierror(500, "Something went wrong while generating access and refresh token");
    }

}
export {generateAccessAndRefreshTokens}