import { Router } from "express";

const authRouter=Router();

import {login,verifyEmail,logout,resetPassword, getCurrentUser,verifyEmailExternal,resetPasswordExternal} from '../controllers/auth.controller.js'
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { parseFormDataOnly } from "../middlewares/multer.middleware.js";
 


authRouter.post('/login',parseFormDataOnly,login);

authRouter.post('/verify-email',parseFormDataOnly,isAuthenticated,verifyEmail);

authRouter.post('/logout',parseFormDataOnly,isAuthenticated,logout);

authRouter.post('/reset-password',parseFormDataOnly,isAuthenticated,resetPassword);

authRouter.get('/me',isAuthenticated,getCurrentUser);

authRouter.post('/verify-email-external',parseFormDataOnly,verifyEmailExternal);

authRouter.post('/reset-password-external',parseFormDataOnly,resetPasswordExternal);



export {authRouter};