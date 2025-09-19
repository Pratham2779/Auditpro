import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ✅ Ensure uploads directory exists
const uploadDir = path.resolve('public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Base storage config (disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ Avatar image (jpg, jpeg, png)
const uploadAvatarImage = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPG, JPEG, PNG allowed'));
  },
});

// ✅ CSV or Excel files
const uploadCsvFile = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only CSV, XLS, XLSX allowed'));
  },
});

// ✅ PDF upload
 const uploadPdfFile = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files allowed'));
  },
});


const parseFormDataOnly = multer().none();

export {
  uploadCsvFile,
  uploadAvatarImage,
  uploadPdfFile,
  parseFormDataOnly
}









// {
//   fieldname: 'file',
//   originalname: 'Book1.xlsx',
//   encoding: '7bit',
//   mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   destination: '/home/prathamesh/Desktop/JewelleryAuditSystem/backend/public/uploads/audits',
//   filename: 'audit_file_1751018133468.xlsx',
//   path: '/home/prathamesh/Desktop/JewelleryAuditSystem/backend/public/uploads/audits/audit_file_1751018133468.xlsx',
//   size: 15469
// }


// {
//   fieldname: 'file',
//   originalname: 'Book1.xlsx',
//   encoding: '7bit',
//   mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//   buffer: <Buffer 50 4b 03 04 14 00 06 00 08 00 00 00 21 00 62 ee 9d 68 5e 01 00 00 90 04 00 00 13 00 08 02 5b 43 6f 6e 74 65 6e 74 5f 54 79 70 65 73 5d 2e 78 6d 6c 20 ... 15419 more bytes>,
//   size: 15469
// }





// Disk storage code =>

// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// // ✅ Fix for ES Modules (__dirname)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ Absolute Upload Paths
// const AVATAR_DIR = path.join(__dirname, '../../public/uploads/avatars');
// const AUDIT_DIR = path.join(__dirname, '../../public/uploads/audits');

// // ✅ Ensure directories exist
// [AVATAR_DIR, AUDIT_DIR].forEach(dir => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// });

// // ✅ Generate unique timestamped filenames
// const generateFilename = (prefix, originalname) => {
//   const timestamp = Date.now();
//   const ext = path.extname(originalname); // .jpg / .xlsx
//   return `${prefix}_${timestamp}${ext}`;
// };

// // === Avatar Upload Middleware ===
// const avatarStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, AVATAR_DIR),
//   filename: (req, file, cb) => cb(null, generateFilename('avatar', file.originalname))
// });

// export const uploadAvatar = multer({
//   storage: avatarStorage,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
//   fileFilter: (req, file, cb) => {
//     const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
//     allowed.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error('Only JPG, JPEG, PNG files allowed'));
//   }
// });

// // === Audit Upload Middleware ===
// const auditStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, AUDIT_DIR),
//   filename: (req, file, cb) => cb(null, generateFilename('audit_file', file.originalname))
// });

// export const uploadAuditFile = multer({
//   storage: auditStorage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
//   fileFilter: (req, file, cb) => {
//     const allowed = [
//       'text/csv',
//       'application/vnd.ms-excel',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     ];
//     allowed.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error('Only CSV, XLS, XLSX files allowed'));
//   }
// });













