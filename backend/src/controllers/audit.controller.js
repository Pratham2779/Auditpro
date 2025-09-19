// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { AuditLog } from "../models/auditlog.model.js";
// import { generateReportId } from "../utils/generateReportId.js";
// import { generateAuditReport } from "../utils/reportGeneration.js";
// import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
// import fs from 'fs';
// import { Salesman } from "../models/salesman.model.js";
// import { File } from "../models/file.model.js";
// import cloudinary from "../configs/cloudinary/index.js";


// const scanItem = asyncHandler(async (req, res) => {
//   const { auditLogId, cpcnumber } = req.body;
//   if (!auditLogId) throw new ApiError(400, 'auditLogId is required');
//   if (!cpcnumber?.trim()) throw new ApiError(400, 'cpcnumber is required');

//   const auditLog = await AuditLog.findById(auditLogId).populate('auditFile');
//   if (!auditLog) throw new ApiError(404, 'AuditLog not found');

//   const auditFile = auditLog.auditFile;
//   if (!auditFile) throw new ApiError(404, 'No audit file associated');

//   const items = auditFile.parsedJson;
//   if (!Array.isArray(items) || items.length === 0) {
//     throw new ApiError(404, 'Audit file data not found or is empty');
//   }

//   const idx = items.findIndex(i => i.cpcnumber === cpcnumber.trim());

//   // Not in list
//   if (idx === -1) {
//     auditFile.unmatchedItems = auditFile.unmatchedItems || [];
//     auditFile.unmatchedItems.push(cpcnumber.trim());

//     auditFile.markModified('unmatchedItems');
//     await auditFile.save();
//     return res
//       .status(200)
//       .json(new ApiResponse(200, { alreadyMatched: false, item: null }, 'Not matched'));
//   }

//   const found = items[idx];

//   // Already matched 
//   if (found.isMatched) {
//     return res
//       .status(200)
//       .json(new ApiResponse(200, { alreadyMatched: true, item: found }, 'Item already matched'));
//   }

//   // First time match
//   found.isMatched = true;
//   auditFile.markModified('parsedJson');
//   await auditFile.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, { alreadyMatched: false, item: found }, 'Item matched successfully'));
// });




// const createReport = asyncHandler(async (req, res) => {
  
//   const { id } = req.params;
//     const auditLogId=id;
//   if (!auditLogId) {
//     throw new ApiError(400, 'auditLogId is required');
//   }

//   const auditLog = await AuditLog.findById(auditLogId)
//     .populate('auditFile')
//     .populate({
//       path: 'auditor',
//       select: 'fullName email phoneNumber avatar',
//       populate: {
//         path: 'avatar',
//         model: 'File',
//         select: 'url downloadUrl public_id'
//       }
//     })
//     .populate({
//       path: 'salesman',
//       select: 'fullName email phoneNumber avatar',
//       populate: {
//         path: 'avatar',
//         model: 'File',
//         select: 'url downloadUrl public_id'
//       }
//     })
//     .populate('counter', 'name counterNumber location');

//   if (!auditLog) {
//     throw new ApiError(404, 'AuditLog not found with the provided ID');
//   }

//   const parsedItems = auditLog.auditFile?.parsedJson || [];
//   const totalItems = parsedItems.length;

//   const missingItems = parsedItems.filter(item => !item.isMatched);
//   const matchedItems = parsedItems.filter(item => item.isMatched);
//   const unmatchedItems = auditLog.auditFile?.unmatchedItems || [];

//   const reportData = {
//     reportId: generateReportId(),
//     auditDateTime: new Date(),

//     auditor: {
//       auditorId: auditLog.auditor?._id || null,
//       fullName: auditLog.auditor?.fullName || null,
//       email: auditLog.auditor?.email || null,
//       phoneNumber: auditLog.auditor?.phoneNumber || null,
//       avatar: auditLog.auditor?.avatar?.downloadUrl || null
//     },

//     counter: {
//       counterName: auditLog.counter?.name || null,
//       location: auditLog.counter?.location || null,
//       counterNumber: auditLog.counter?.counterNumber || null
//     },

//     salesman: {
//       fullName: auditLog.salesman?.fullName || null,
//       email: auditLog.salesman?.email || null,
//       phoneNumber: auditLog.salesman?.phoneNumber || null,
//       avatar: auditLog.salesman?.avatar?.downloadUrl || null
//     },

//     morningInventoryCount: totalItems,
//     missingItems,
//     matchedItems,
//     unmatchedItems
//   };

//   // Generate and upload report
//   try {
//     const reportLocalPath = await generateAuditReport(reportData);

//     const response = await uploadToCloudinary(reportLocalPath, 'pdf', 'raw');
     

//     const reportFile= await File.create({
//           uploader:auditLog.auditor?._id,
//           original_filename:reportData.reportId,
//           public_id:response?.public_id,
//           url:response?.url,
//           downloadUrl:response?.downloadUrl,
//     });
  
//     auditLog.reportFile=reportFile;
//     auditLog.auditStatus='audited';
  
//     await auditLog.save();

//     res.status(201).json(new ApiResponse(201, response, 'Report generated successfully'));
//   } catch (error) {
//     console.error('Report generation/upload failed:', error);
//     throw new ApiError(500, 'Failed to generate/upload report');
//   }
// });

// const setSalesman=asyncHandler(async (req,res)=>{
//   const {id,salesmanId}=req.body;

//   if(!id || !salesmanId){
//     throw new ApiError(400,'auditLog id or salesmanId missing');
//   }
//   const auditLog=await AuditLog.findById(id);

//   if(!auditLog){
//     throw new ApiError(400,'auditLog not found!');
//   }

//   if(!await Salesman.findById(salesmanId)){
//     throw new ApiError(400,'Salesman not found .');
//   }
//   auditLog.salesman=salesmanId;
//   await auditLog.save();
//   res.status(200).json(new ApiResponse(200,{},'Salesman selection successfull'));

// });



// const resetAuditing = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   if (!id) throw new ApiError(400, 'auditLog id not present');

//   const auditLog = await AuditLog.findById(id)
//     .populate('auditFile')
//     .populate('reportFile')      
//     .exec();

//   if (!auditLog) throw new ApiError(400, 'auditLog not found');


//   if (auditLog.reportFile?.public_id) {
//     try {
//       await cloudinary.uploader.destroy(auditLog.reportFile?.public_id,{ resource_type: 'raw' });
//     } catch (err) {
//       console.warn(`Cloudinary: failed to delete reportFile ${auditLog.reportFile?.public_id}`, err);
//     }
//   }
  
//   // Reset AuditLog fields
//   auditLog.salesman    = null;
//   auditLog.reportFile  = null;
//   auditLog.auditStatus = 'pending';  
//   await auditLog.save();


//   // Reset the underlying File document
//   if (auditLog.auditFile) {
//     const file = auditLog.auditFile;
//     // clear out any matched flags:
//     file.parsedJson = file.parsedJson.map(item => ({
//       ...item,
//       isMatched: false
//     }));
//     // reset unmatchedItems
//     file.unmatchedItems = [];
//     await file.save();
//   }

//   res
//     .status(200)
//     .json(new ApiResponse(200, {}, 'reset auditLog successfully'));
// });





// export {
//     scanItem,
//     createReport,
//     setSalesman,
//     resetAuditing
// }



























import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AuditLog } from "../models/auditlog.model.js";
import { File } from "../models/file.model.js";
import { generateReportId } from "../utils/generateReportId.js";
import { generateAuditReport } from "../utils/reportGeneration.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../configs/cloudinary/index.js";
import fs from 'fs';
import { Salesman } from "../models/salesman.model.js";


// ─────────────── SCAN CPC ITEM ───────────────
const scanItem = asyncHandler(async (req, res) => {
  const { auditLogId, cpcnumber } = req.body;
  if (!auditLogId)    throw new ApiError(400, 'auditLogId is required');
  if (!cpcnumber?.trim()) throw new ApiError(400, 'cpcnumber is required');

  // Load auditLog and its File
  const auditLog = await AuditLog.findById(auditLogId).populate('auditFile');
  if (!auditLog)      throw new ApiError(404, 'AuditLog not found');
  const file = auditLog.auditFile;
  if (!file)          throw new ApiError(404, 'Audit file not found');

  const key = cpcnumber.trim();

  // If in missingItems → mark matched
  if (file.missingItems.has(key)) {
    const item = file.missingItems.get(key);
    file.matchedItems.set(key, item);
    file.missingItems.delete(key);
    await file.save();
    return res
      .status(200)
      .json(new ApiResponse(200, { status: 'matched', item }, 'Item matched'));
  }

  // Already matched?
  if (file.matchedItems.has(key)) {
    return res
      .status(200)
      .json(new ApiResponse(200, { status: 'already_matched' }, 'Item already matched'));
  }

  // Otherwise mark unmatched
  if (!file.unmatchedItems.has(key)) {
    file.unmatchedItems.set(key, { cpcnumber: key, scannedAt: new Date() });
    await file.save();
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { status: 'unmatched' }, 'Item unmatched'));
});


// ─────────────── CREATE AUDIT REPORT ───────────────
const createReport = asyncHandler(async (req, res) => {
  const { id: auditLogId } = req.params;
  if (!auditLogId) throw new ApiError(400, 'auditLogId is required');

  const auditLog = await AuditLog.findById(auditLogId)
    .populate('auditFile')
    .populate({
      path: 'auditor',
      select: 'fullName email phoneNumber avatar',
      populate: { path: 'avatar', model: 'File', select: 'downloadUrl' }
    })
    .populate({
      path: 'salesman',
      select: 'fullName email phoneNumber avatar',
      populate: { path: 'avatar', model: 'File', select: 'downloadUrl' }
    })
    .populate('counter', 'name counterNumber location');
  if (!auditLog)   throw new ApiError(404, 'AuditLog not found');

  const file = auditLog.auditFile;
  if (!file)       throw new ApiError(404, 'Audit file not found');

  // Extract arrays from maps
  const matchedItems   = Array.from(file.matchedItems.values());
  const unmatchedItems = Array.from(file.unmatchedItems.values());
  const missingItems   = Array.from(file.missingItems.values());
  const totalItems     = matchedItems.length + unmatchedItems.length + missingItems.length;

  // Build report payload
  const reportData = {
    reportId:            generateReportId(),
    auditDateTime:       new Date(),
    auditor: {
      id:          auditLog.auditor?._id,
      fullName:    auditLog.auditor?.fullName,
      email:       auditLog.auditor?.email,
      phoneNumber: auditLog.auditor?.phoneNumber,
      avatar:      auditLog.auditor?.avatar?.downloadUrl
    },
    counter: {
      name:          auditLog.counter?.name,
      location:      auditLog.counter?.location,
      counterNumber: auditLog.counter?.counterNumber
    },
    salesman: {
      id:          auditLog.salesman?._id,
      fullName:    auditLog.salesman?.fullName,
      email:       auditLog.salesman?.email,
      phoneNumber: auditLog.salesman?.phoneNumber,
      avatar:      auditLog.salesman?.avatar?.downloadUrl
    },
    totalItems,
    matchedItems,
    unmatchedItems,
    missingItems
  };

  // Generate PDF/CSV, upload, and save as File
  let reportPath, cloudRes, reportFile;
  try {
    reportPath = await generateAuditReport(reportData);
    cloudRes   = await uploadToCloudinary(reportPath, 'pdf', 'raw');
    reportFile = await File.create({
      uploader:          auditLog.auditor?._id,
      original_filename: reportData.reportId,
      public_id:         cloudRes.public_id,
      url:                cloudRes.url,
      downloadUrl:        cloudRes.downloadUrl
    });

    if(auditLog.reportFile){
      const oldReportFile=await File.findById(auditLog.reportFile._id);
      if(oldReportFile)await cloudinary.uploader.destroy(oldReportFile.public_id, { resource_type: "raw" }); 
    }

    auditLog.reportFile   = reportFile._id;
    auditLog.auditStatus  = 'audited';
    await auditLog.save();
  } catch (err) {
    throw new ApiError(500, 'Report generation/upload failed: ' + err.message);
  } finally {
    if (reportPath && fs.existsSync(reportPath)) fs.unlinkSync(reportPath);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, cloudRes, 'Report generated successfully'));
});


// ─────────────── SET SALESMAN ───────────────
const setSalesman = asyncHandler(async (req, res) => {
  const { id, salesmanId } = req.body;
  if (!id || !salesmanId) throw new ApiError(400, 'auditLog id and salesmanId are required');

  const auditLog = await AuditLog.findById(id);
  if (!auditLog)       throw new ApiError(404, 'AuditLog not found');
  if (!await Salesman.findById(salesmanId)) {
    throw new ApiError(404, 'Salesman not found');
  }

  auditLog.salesman = salesmanId;
  await auditLog.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Salesman set successfully'));
});


// ─────────────── RESET AUDITING ───────────────
const resetAudit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, 'auditLog id is required');

  const auditLog = await AuditLog.findById(id).populate('auditFile');
  if (!auditLog) throw new ApiError(404, 'AuditLog not found');

  // delete existing reportFile from Cloudinary
  if (auditLog.reportFile?.public_id) {
    try {
      await cloudinary.uploader.destroy(auditLog.reportFile.public_id, { resource_type: 'raw' });
    } catch (_) { /* ignore */ }
  }

  // reset AuditLog fields
  auditLog.salesman   = null;
  auditLog.reportFile = null;
  auditLog.auditStatus = 'pending';
  await auditLog.save();

  // reset File maps
  const file = auditLog.auditFile;
  if (file) {
    // rebuild missingItems from parsedJson
    const missingItems = {};
    for (const item of file.parsedJson) {
      const key = String(item.cpcnumber).trim();
      missingItems[key] = item;
    }
    file.matchedItems   = {};
    file.unmatchedItems = {};
    file.missingItems   = missingItems;
    await file.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Audit reset successfully'));
});



const removeItem = asyncHandler(async (req, res) => {
  const { auditLogId, cpcnumber } = req.body;
  if (!auditLogId || !cpcnumber) {
    throw new ApiError(400, 'auditLogId and cpcnumber are required');
  }

  const auditLog = await AuditLog.findById(auditLogId).populate('auditFile');
  if (!auditLog) {
    throw new ApiError(404, 'Audit log not found');
  }

  const file = auditLog.auditFile;

  if (file.matchedItems?.has(cpcnumber)) {

    const item = file.matchedItems.get(cpcnumber);
    file.matchedItems.delete(cpcnumber);
    file.missingItems.set(cpcnumber, item);

  } else if (file.unmatchedItems?.has(cpcnumber)) {

    file.unmatchedItems.delete(cpcnumber);
    
  } else {
    throw new ApiError(404, 'CPC number not found in matched or unmatched items');
  }

  await file.save();

  return res.status(200).json({
    success: true,
    message: 'Item removed'
  });
});






export {
  scanItem,
  createReport,
  setSalesman,
  resetAudit,
  removeItem
};
