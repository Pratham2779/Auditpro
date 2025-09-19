import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTokenAndSetCookie } from "../utils/generateTokensAndSetCookie.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { PROJECT_NAME } from '../constants.js';
import { hash } from 'bcrypt';
import { User } from "../models/user.model.js";
import { sendMail } from "../configs/email/index.js";
import bcrypt from 'bcrypt'
import { otpTemplate } from "../configs/email/templates/otp.template.js";
import ms from "ms";

const login = asyncHandler(async (req, res, next) => {
    const { email, password, rememberMe, role } = req.body;

    if (!email || !password || !role) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    if (user.role != role.toLowerCase()) {
        throw new ApiError(400, "Invalid role selected");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect password");
    }

    const { refreshToken, accessToken } = generateTokenAndSetCookie(user, res, rememberMe);

    user.refreshToken=refreshToken;
    await user.save();


    return res
        .status(200)
        .json(
            new ApiResponse(200, { refreshToken, accessToken }, "Login successful")
        );
});




const logout = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id );

    user.refreshToken = null;
    await user.save();

    // Clear cookies
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Logged out successfully"));

});




const verifyEmail = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Missing userId");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }


  const otp = generateVerificationToken(); 
  const otpExpiry =new Date(Date.now() + ms(process.env.OTP_EXPIRY || 10 * 60 * 1000));


  const htmlTemplate = otpTemplate({
    otp,
    otpExpiry: "10 minutes",
    userName: user.fullName,
    projectName: PROJECT_NAME,
  });

  await sendMail({
    to: user.email,
    subject: `${PROJECT_NAME} - Email Verification OTP`,
    html: htmlTemplate,
    text: `Your OTP is: ${otp}`,
  });

  
  user.otp = otp;
  user.otpExpiry =otpExpiry;
  await user.save();

  return res
    .status(201)
    .json(new ApiResponse(201, null, "OTP sent successfully"));
});




const resetPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  if (!otp) {
    throw new ApiError(400, 'OTP is required');
  }

  if (!newPassword) {
    throw new ApiError(400, 'New password is required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }


  console.log("Now         :", new Date().toISOString());
console.log("otpExpiry   :", user.otpExpiry); 
console.log("ExpiryTime  :", new Date(user.otpExpiry).toISOString());
console.log("Diff (ms)   :", new Date(user.otpExpiry).getTime() - Date.now());


  if (!user.otpExpiry || Date.now() > new Date(user.otpExpiry).getTime()) {
    throw new ApiError(400, 'OTP has expired');
  }

  if (otp !== user.otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  user.password = await hash(newPassword, 10);

  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Password changed successfully.'));
});



const getCurrentUser = asyncHandler(async (req, res) => {

  const user= await User.findById(req?.user?._id).populate('avatar');

  //console.log(user);

  const safeUser = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "User info fetched successfully"));
});



const verifyEmailExternal=asyncHandler(async (req,res)=>{
    const {email}=req.body;

    if(!email)throw new ApiError(400,'Email is mandatory');

    const user=await User.findOne({email});
   

  const otp = generateVerificationToken(); 
  const otpExpiry =new Date(Date.now() + ms(process.env.OTP_EXPIRY || 10 * 60 * 1000));

  console.log(user);

  const htmlTemplate = otpTemplate({
    otp,
    otpExpiry: "10 ",
    userName: user.fullName,
    projectName: PROJECT_NAME,
  });

  await sendMail({
    to: user.email,
    subject: `${PROJECT_NAME} - Email Verification OTP`,
    html: htmlTemplate,
    text: `Your OTP is: ${otp}`,
  });

  
  user.otp = otp;
  user.otpExpiry =otpExpiry;
  await user.save();

   return res
    .status(201)
    .json(new ApiResponse(201, null, "OTP sent successfully"));
    
});


const resetPasswordExternal=asyncHandler(async (req,res)=>{
      const { otp, newPassword,email } = req.body;

 if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  if (!otp) {
    throw new ApiError(400, 'OTP is required');
  }

  if (!newPassword) {
    throw new ApiError(400, 'New password is required');
  }
  

  const user = await User.findOne({email});
  if (!user) {
    throw new ApiError(404, 'User not found');
  }


  console.log("Now         :", new Date().toISOString());
console.log("otpExpiry   :", user.otpExpiry); 
console.log("ExpiryTime  :", new Date(user.otpExpiry).toISOString());
console.log("Diff (ms)   :", new Date(user.otpExpiry).getTime() - Date.now());


  if (!user.otpExpiry || Date.now() > new Date(user.otpExpiry).getTime()) {
    throw new ApiError(400, 'OTP has expired');
  }

  if (otp !== user.otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  user.password = await hash(newPassword, 10);

  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Password changed successfully.'));


});



export {
    login,
    logout,
    verifyEmail,
    resetPassword,
    getCurrentUser,
    verifyEmailExternal,
    resetPasswordExternal
}