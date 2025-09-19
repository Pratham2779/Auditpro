import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';




// const isAuthenticated=asyncHandler(async (req,res,next)=>{

//     const token =req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");

//     if(!token){
//         throw new ApiError(401,'Unauthorized: No token provided')
//     }

//      let decoded;
//   try {
//     decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
//   } catch (err) {
//     throw new ApiError(401, "Invalid or expired token");
//   }


//     if(!decoded?._id){
//         throw new ApiError(401, "Unauthorized: Invalid token");
//     }

//      req.user = await User.findById(decoded._id).select("-password"); 

//     if (!req.user) {
//       throw new ApiError(401, "User no longer exists");
//     }
//     next();

// });


const isAuthenticated = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
  } catch (err) {
    // You can even inspect the error type to send more specific messages
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please login again."
        : "Invalid or tampered token.";
    throw new ApiError(401, message);
  }

  if (!decoded?._id) {
    throw new ApiError(401, "Unauthorized: Token payload is invalid");
  }

  const user = await User.findById(decoded._id).select("-password");

  if (!user) {
    throw new ApiError(401, "Unauthorized: User no longer exists");
  }

  req.user = user; // attach the full user to req
  next();
});


const isAuthorised = (userRole) =>
  asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(400, 'Missing user info in token');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(400, 'User does not exist');
    }

    if (user.role !== userRole) {
      throw new ApiError(403, 'Unauthorised, restricted route.');
    }

    next();
  });





export {isAuthenticated,isAuthorised};