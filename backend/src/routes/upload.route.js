
import { uploadAvatar,uploadCSV,uploadPDF } from "../controllers/uploadController.js";

import express from 'express';
import { uploadAvatarImage,uploadPdfFile,uploadCsvFile } from "../middlewares/multer.middleware.js";

const demorouter = express.Router();

demorouter.post('/upload/avatar', uploadAvatarImage.single('file'), uploadAvatar);
demorouter.post('/upload/csv', uploadCsvFile.single('file'), uploadCSV);
demorouter.post('/upload/pdf', uploadPdfFile.single('file'), uploadPDF);

export default demorouter;