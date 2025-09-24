import { User } from "../models/user.model.js";
import { AuditLog } from "../models/auditlog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Salesman } from "../models/salesman.model.js";
import { File } from "../models/file.model.js";
import { sheetToJsonFromPath } from "../utils/sheetToJson.js";
import { Counter } from '../models/counter.model.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import cloudinary from "../configs/cloudinary/index.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import fs from 'fs';
import { getISTDateRange } from "../utils/time.js";




const createAuditlog = asyncHandler(async (req, res) => {
  const writerId = req.user._id;
  const { auditorId, counterId, remark, auditDate } = req.body;
  const file = req.file;

  // 1) Basic validation
  if (!auditorId) throw new ApiError(400, "Auditor ID is required.");
  if (!counterId) throw new ApiError(400, "Counter ID is required.");
  if (!file) throw new ApiError(400, "CSV or Excel file is required.");

  // 2) Lookup refs
  const [auditor, counter] = await Promise.all([
    User.findById(auditorId),
    Counter.findById(counterId),
  ]);
  if (!auditor) throw new ApiError(400, "Auditor does not exist.");
  if (!counter) throw new ApiError(400, "Counter does not exist.");

  // 3) Parse sheet
  const parsedJson = sheetToJsonFromPath(file.path);
  if (!parsedJson.length) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new ApiError(400, "Uploaded file is empty or could not be parsed.");
  }

  // 4) Build item-maps
  const matchedItems = {};
  const unmatchedItems = {};
  const missingItems = {};
  for (const item of parsedJson) {
    const key = String(item.cpcnumber).trim();
    missingItems[key] = item;
  }

  // 5) Upload + cleanup
  let cloudinaryRes;
  try {
    cloudinaryRes = await uploadToCloudinary(file.path, "csv");
  } catch (err) {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw new ApiError(500, `Cloudinary upload failed: ${err.message}`);
  }
  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  // 6) Create File doc
  const auditFile = await File.create({
    uploader: writerId,
    original_filename: cloudinaryRes.original_filename,
    public_id: cloudinaryRes.public_id,
    url: cloudinaryRes.url,
    downloadUrl: cloudinaryRes.downloadUrl,
    parsedJson,
    matchedItems,
    unmatchedItems,
    missingItems,
  });
  if (!auditFile) throw new ApiError(500, "Failed to create audit file record.");

  // 7) Create AuditLog
  const log = await AuditLog.create({
    counter: counterId,
    auditor: auditorId,
    remark,
    auditFile: auditFile._id,
    // ensure this is stored as a Date
    auditDate: auditDate ? new Date(auditDate) : new Date(),
  });
  if (!log) throw new ApiError(500, "Failed to create audit log.");

  res.status(201).json(new ApiResponse(201, log, "Audit log created successfully!"));
});





const deleteAuditlog = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, 'AuditLog ID is required');
  }

  const auditLog = await AuditLog.findById(id);
  if (!auditLog) {
    throw new ApiError(404, 'Audit log not found');
  }

  // Remove the auditFile from Cloudinary and DB
  if (auditLog.auditFile) {
    const auditFile = await File.findById(auditLog.auditFile);
    if (auditFile?.public_id) {
      try {
        await cloudinary.uploader.destroy(auditFile.public_id, { resource_type: 'raw' });
      } catch (err) {
        throw new ApiError(500, 'Error deleting audit file from Cloudinary');
      }
    }
    await File.deleteOne({ _id: auditLog.auditFile });
  }

  // Remove the reportFile from Cloudinary and DB
  if (auditLog.reportFile) {
    const reportFile = await File.findById(auditLog.reportFile);
    if (reportFile?.public_id) {
      try {
        await cloudinary.uploader.destroy(reportFile.public_id, { resource_type: 'raw' });
      } catch (err) {
        throw new ApiError(500, 'Error deleting report file from Cloudinary');
      }
    }
    await File.deleteOne({ _id: auditLog.reportFile });
  }

  // Finally, delete the audit log record
  await AuditLog.deleteOne({ _id: id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Audit log and associated files deleted successfully'));
});





const updateAuditlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const writerId = req?.user?._id;
  const { auditorId, counterId, remark, auditStatus, auditDate } = req.body;
  const fileUpload = req.file;

  // 1) Basic validation
  if (!id) {
    throw new ApiError(400, "AuditLog ID is required.");
  }

  const auditLog = await AuditLog.findById(id);
  if (!auditLog) {
    throw new ApiError(404, "Audit log not found.");
  }

  // 2) Update references
  if (auditorId) {
    const auditor = await User.findById(auditorId);
    if (!auditor) throw new ApiError(400, "Auditor does not exist.");
    auditLog.auditor = auditorId;
  }
  if (counterId) {
    const counter = await Counter.findById(counterId);
    if (!counter) throw new ApiError(400, "Counter does not exist.");
    auditLog.counter = counterId;
  }

  // 3) Update other fields
  if (remark !== undefined)      auditLog.remark      = remark;
  if (auditStatus !== undefined) auditLog.auditStatus = auditStatus;
  if (auditDate)                 auditLog.auditDate   = new Date(auditDate);

  // 4) Handle file replacement (if any)
  if (fileUpload) {
  // remember the old file’s ID before we overwrite it:
  const oldFileId = auditLog.auditFile;

  // a) parse & validate
  const parsedJson = sheetToJsonFromPath(fileUpload.path);
  if (!parsedJson || parsedJson.length === 0) {
    if (fs.existsSync(fileUpload.path)) fs.unlinkSync(fileUpload.path);
    throw new ApiError(400, "Uploaded file is empty or could not be parsed.");
  }

  // b) upload to Cloudinary
  let cloudRes;
  try {
    cloudRes = await uploadToCloudinary(fileUpload.path, "csv");
  } catch (err) {
    if (fs.existsSync(fileUpload.path)) fs.unlinkSync(fileUpload.path);
    throw new ApiError(500, "Cloudinary upload failed: " + err.message);
  } finally {
    if (fs.existsSync(fileUpload.path)) fs.unlinkSync(fileUpload.path);
  }

  // c) initialize comparison maps
  const matchedItems   = {};
  const unmatchedItems = {};
  const missingItems   = {};
  for (const item of parsedJson) {
    const key = String(item.cpcnumber ?? "").trim();
    if (key) missingItems[key] = item;
  }

  // d) create new File record
  const newFile = await File.create({
    uploader:          writerId,
    original_filename: cloudRes.original_filename,
    public_id:         cloudRes.public_id,
    url:               cloudRes.url,
    downloadUrl:       cloudRes.downloadUrl,
    parsedJson,
    matchedItems,
    unmatchedItems,
    missingItems,
  });

  // e) attach to auditLog & reset status
  auditLog.auditFile   = newFile._id;
  auditLog.auditStatus = "pending";

  // f) delete the *old* file from both DB and Cloudinary
  if (oldFileId) {
    const oldFile = await File.findById(oldFileId);
    if (oldFile) {
      if (oldFile.public_id) {
        await cloudinary.uploader.destroy(oldFile.public_id, { resource_type: "raw" });
      }
      await oldFile.deleteOne();
    }
  }
}
  // 5) Save and respond
  const updated = await auditLog.save();
  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Audit log updated successfully."));
});





const getAllAuditlogs = asyncHandler(async (req, res) => {

  const userRole = req.user?.role; // Get the user's role from the request object

  const {
    auditStatus,
    salesman,
    auditor,
    counter,
    remark,
    startDate,
    endDate,
    auditDate,
    page = 1,
    limit = 10,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};

  // Direct match filters
  if (auditStatus) filter.auditStatus = auditStatus;
  if (salesman) filter.salesman = salesman;
  if (auditor) filter.auditor = auditor;
  if (counter) filter.counter = counter;
  if (remark) filter.remark = { $regex: remark, $options: 'i' };

  // Single-day auditDate filter
  if (auditDate) {
    const { start, end } = getISTDateRange(auditDate);
    filter.auditDate = { $gte: start, $lte: end };
  }

  else if (startDate || endDate) {
    filter.auditDate = {};
    if (startDate) filter.auditDate.$gte = new Date(startDate);
    if (endDate) filter.auditDate.$lte = new Date(endDate);

  }

  // Universal search
  if (search) {
    const rx = new RegExp(search, 'i');
    const users = await User.find({ $or: [{ fullName: rx }, { email: rx }] }).select('_id');
    const counters = await Counter.find({ $or: [{ name: rx }, { location: rx }] }).select('_id');

    const uids = users.map(u => u._id);
    const cids = counters.map(c => c._id);

    filter.$or = [
      { auditStatus: rx },
      { remark: rx },
      { auditor: { $in: uids } },
      { salesman: { $in: uids } },
      { counter: { $in: cids } }
    ];
  }

  const sortObj = {};
  if (sortBy) {
    sortObj[sortBy] = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  }

  // Start building the Mongoose query
  let query = AuditLog.find(filter)
    .skip(Number(skip))
    .limit(Number(limit))
    .sort(sortObj)
    .populate({
      path: 'auditor',
      select: 'fullName email avatar',
      populate: {
        path: 'avatar',
        model: 'File',
        select: 'url downloadUrl public_id'
      }
    })
    .populate('salesman', 'fullName email')
    .populate('counter', 'name counterNumber location')
    .populate('auditFile')
    .populate('reportFile');


  const auditLogs = await query;


  const total = await AuditLog.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      auditLogs,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    }, "Audit logs fetched successfully")
  );
});




const getAuditlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, 'AuditLog ID is required');
  }

  const auditLog = await AuditLog.findById(id)
    .populate('auditor', 'fullName email')
    .populate('salesman', 'fullName email')
    .populate('counter', 'name location')
    .populate('auditFile')
    .populate('reportFile');

  if (!auditLog) {
    throw new ApiError(404, 'Audit log not found');
  }

  return res.status(200).json(
    new ApiResponse(200, auditLog, "Audit log fetched successfully")
  );
});


export {
  createAuditlog,
  updateAuditlog,
  deleteAuditlog,
  getAllAuditlogs,
  getAuditlogById
};

