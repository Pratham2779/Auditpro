

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
