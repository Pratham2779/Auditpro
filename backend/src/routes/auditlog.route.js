import { Router } from "express";
import { createAuditlog, deleteAuditlog, getAllAuditlogs, getAuditlogById, updateAuditlog } from "../controllers/auditlog.controller.js";
import { uploadCsvFile } from "../middlewares/multer.middleware.js";
import { isAuthenticated,isAuthorised } from "../middlewares/auth.middleware.js";

const auditlogRouter=Router();


auditlogRouter.post('/create',uploadCsvFile.single('auditFile'),isAuthenticated,isAuthorised('admin'),createAuditlog);

auditlogRouter.get('/',isAuthenticated,getAllAuditlogs);

auditlogRouter.get('/:id',isAuthenticated,getAuditlogById);

auditlogRouter.delete('/delete/:id',isAuthenticated,isAuthorised('admin'),deleteAuditlog);

auditlogRouter.put('/update/:id',uploadCsvFile.single('auditFile'),isAuthenticated,isAuthorised('admin'),updateAuditlog);



export {auditlogRouter};
