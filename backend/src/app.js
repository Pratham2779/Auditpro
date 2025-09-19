import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url';
import path from 'path';

const app=express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middlewares

// app.use(cors());
app.use(cors({
  origin: process.env.CLIENT_URL,   //  frontend origin
  credentials: true,                 //  allow cookies
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));



// routes
import { authRouter } from './routes/auth.route.js';
import { userRouter } from './routes/user.route.js';
import { auditlogRouter } from './routes/auditlog.route.js';
import { notificationRouter } from './routes/notification.route.js';
import { salesmanRouter } from './routes/salesman.route.js';
import { counterRouter } from './routes/counter.route.js';
import demorouter from './routes/upload.route.js';
import { auditRouter } from './routes/audit.route.js';


app.get('/',(req,res)=>{res.send("Hello world!")});
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/auditlog',auditlogRouter);
app.use('/api/v1/notification',notificationRouter);
app.use('/api/v1/salesman',salesmanRouter);
app.use('/api/v1/counter',counterRouter);
app.use('/api/v1/demo',demorouter);
app.use('/api/v1/audit',auditRouter);




//error Handlers middlewares
import {errorHandler} from './middlewares/errorHandler.middleware.js';


app.use(errorHandler);
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});



export {app};
