import { Router } from "express";

const counterRouter=Router();
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAuthorised } from "../middlewares/auth.middleware.js";
import { createCounter, deleteCounter, getAllCounter, getCounterById, updateCounter } from "../controllers/counter.controller.js";
import { parseFormDataOnly } from "../middlewares/multer.middleware.js";


counterRouter.post('/create', parseFormDataOnly,isAuthenticated,isAuthorised('admin'),createCounter);

counterRouter.get('/:id',isAuthenticated,getCounterById);

counterRouter.get('/',isAuthenticated,getAllCounter);

counterRouter.put('/update/:id',parseFormDataOnly,isAuthenticated,isAuthorised('admin'),updateCounter);

counterRouter.delete('/delete/:id',isAuthenticated,isAuthorised('admin'),deleteCounter);


export {counterRouter};