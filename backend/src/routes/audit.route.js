import { Router } from "express";
import { isAuthenticated, isAuthorised } from "../middlewares/auth.middleware.js";
import { createReport, setSalesman, scanItem,resetAudit,removeItem } from "../controllers/audit.controller.js";

const auditRouter=Router();

auditRouter.post('/scanItem',isAuthenticated,isAuthorised('auditor'),scanItem);

auditRouter.post('/createReport/:id',isAuthenticated,isAuthorised('auditor'),createReport);

auditRouter.post('/setSalesman',isAuthenticated,isAuthorised('auditor'),setSalesman);

auditRouter.post('/resetAudit/:id',isAuthenticated,isAuthorised('auditor'),resetAudit);

auditRouter.delete('/removeItem',isAuthenticated,isAuthorised('auditor'),removeItem);

export {auditRouter};