import { Router } from "express";
import {isAuthenticated} from '../middlewares/auth.middleware.js'
import { deleteNotification, getAllNotifications, getNotificationById, sendNotification, updateNotification } from "../controllers/notification.controller.js";

const notificationRouter=Router();


notificationRouter.get('/',isAuthenticated,getAllNotifications);

notificationRouter.get('/:id',isAuthenticated,getNotificationById);

notificationRouter.post('/send',isAuthenticated,sendNotification);

notificationRouter.delete('/delete/:id',isAuthenticated,deleteNotification);

notificationRouter.put('/update/:id',isAuthenticated,updateNotification);


export {notificationRouter};