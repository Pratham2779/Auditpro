import { Router } from "express";

const salesmanRouter=Router();

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAuthorised } from "../middlewares/auth.middleware.js";
import { uploadAvatarImage } from "../middlewares/multer.middleware.js";
import { createSalesman, deleteSalesman, getAllSalesman, getSalesmanById, updateSalesman } from "../controllers/salesman.controller.js";



salesmanRouter.post('/create',uploadAvatarImage.single('avatar'),isAuthenticated,isAuthorised('admin'),createSalesman);

salesmanRouter.get('/',isAuthenticated,getAllSalesman);

salesmanRouter.get('/:id',isAuthenticated,getSalesmanById);

salesmanRouter.put('/update/:id',uploadAvatarImage.single('avatar'),isAuthenticated,isAuthorised('admin'),updateSalesman);

salesmanRouter.delete('/delete/:id',isAuthenticated,isAuthorised('admin'),deleteSalesman);



export {salesmanRouter};