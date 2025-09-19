import { Router } from "express";

const userRouter=Router();

import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/user.controller.js';

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAuthorised } from "../middlewares/auth.middleware.js";
import { uploadAvatarImage } from "../middlewares/multer.middleware.js";


userRouter.get('/',isAuthenticated,getAllUsers);

userRouter.get('/:id',isAuthenticated,getUserById);

userRouter.post('/create',uploadAvatarImage.single('avatar'),isAuthenticated,isAuthorised('admin'),createUser);

userRouter.delete('/delete/:id',isAuthenticated,isAuthorised('admin'),deleteUser);

userRouter.put('/update/:id',uploadAvatarImage.single('avatar'),isAuthenticated,updateUser);



export {userRouter};