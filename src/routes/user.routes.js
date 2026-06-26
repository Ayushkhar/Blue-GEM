import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {loginuser, logoutuser, refreshAccesstoken} from "../controllers/user.controller.js"

const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginuser)
// router.route("/login").post(login)


// Secured routes 
router.route("/logout").post(verifyJWT, logoutuser)
router.route("/refresh-token").post(refreshAccesstoken)

export default router;