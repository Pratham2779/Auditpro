// controllers/notification.controller.js

import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getISTDateRange } from "../utils/time.js";

const validateDate = (date) => !date || !isNaN(Date.parse(date));

/**
 * GET /notifications
 * Query params:
 *   - send:    'true' | 'false'
 *   - received:'true' | 'false'
 *   - search:  string
 *   - date:    YYYY-MM-DD
 */

const getAllNotifications = asyncHandler(async (req, res) => {
  const { send, received, search, date } = req.query;
  const userId = req.user._id;

  if (send && !['true','false'].includes(send))
    throw new ApiError(400, '`send` must be "true" or "false"');
  if (received && !['true','false'].includes(received))
    throw new ApiError(400, '`received` must be "true" or "false"');


  if (search && typeof search !== 'string')
    throw new ApiError(400, 'Search must be a string');
  if (date && !validateDate(date))
    throw new ApiError(400, 'Invalid date format, expected YYYY-MM-DD');

  const conditions = [];
  if (send === 'true')     conditions.push({ sender: userId });
  if (received === 'true') conditions.push({ receiver: userId });
  if (!send && !received)  conditions.push({ sender: userId }, { receiver: userId });

  const baseQuery = conditions.length > 1
    ? { $or: conditions }
    : conditions[0];

  if (search) {
    baseQuery.$text = { $search: search };
  }

  if (date) {
    const { start, end } = getISTDateRange(date);
    baseQuery.createdAt = { $gte: start, $lt: end };
  }

  const notifications = await Message
    .find(baseQuery)
    .sort('-createdAt')
    .populate({
      path: 'sender',
      select: 'fullName email avatar',
      populate: { 
        path: 'avatar', 
        select: 'url' 
      }
    })
    .populate({
      path: 'receiver',
      select: 'fullName email avatar',
      populate: { 
        path: 'avatar', 
        select: 'url' 
      }
    });

  return res.status(200).json(
    new ApiResponse(200,notifications, 'Notifications fetched successfully')
  );
});

/**
 * GET /notifications/:id
 */
const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!id.match(/^[0-9a-fA-F]{24}$/))
    throw new ApiError(400, 'Invalid notification ID');

  const message = await Message.findById(id)
    .populate('sender',   'fullName email')
    .populate('receiver', 'fullName email');

  if (!message)
    throw new ApiError(404, 'Notification not found');

  if (
    !message.sender._id.equals(userId) &&
    !message.receiver._id.equals(userId)
  ) {
    throw new ApiError(403, 'Not authorized to view this notification');
  }

  return res.status(200).json(
    new ApiResponse(200, message, 'Notification fetched successfully')
  );
});

/**
 * POST /notifications
 * Body: { receiver: ObjectId, subject?: string, content: string }
 */
const sendNotification = asyncHandler(async (req, res) => {
  const { receiver, subject = '', content } = req.body;
  const sender = req.user._id;

  if (!receiver || !receiver.match(/^[0-9a-fA-F]{24}$/))
    throw new ApiError(400, 'Valid receiver ID is required');
  if (!content || typeof content !== 'string')
    throw new ApiError(400, 'Content is required and must be a string');

  const receiverUser = await User.findById(receiver);
  if (!receiverUser)
    throw new ApiError(404, 'Receiver not found');

  const message = await Message.create({
    sender,
    receiver,
    subject,
    content
  });

  return res.status(201).json(
    new ApiResponse(201, message, 'Notification sent successfully')
  );
});

/**
 * DELETE /notifications/:id
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!id.match(/^[0-9a-fA-F]{24}$/))
    throw new ApiError(400, 'Invalid notification ID');

  const message = await Message.findById(id);
  if (!message)
    throw new ApiError(404, 'Notification not found');
  if (!message.sender.equals(userId))
    throw new ApiError(403, 'Only the sender can delete this notification');

  await message.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, {}, 'Notification deleted successfully')
  );
});

/**
 * PATCH /notifications/:id
 * Body: { subject?: string, content: string }
 */
const updateNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject = '', content } = req.body;
  const userId = req.user._id;

  if (!id.match(/^[0-9a-fA-F]{24}$/))
    throw new ApiError(400, 'Invalid notification ID');
  if (!content || typeof content !== 'string')
    throw new ApiError(400, 'Content is required and must be a string');

  const message = await Message.findById(id);
  if (!message)
    throw new ApiError(404, 'Notification not found');
  if (!message.sender.equals(userId))
    throw new ApiError(403, 'Only the sender can update this notification');

  message.subject = subject;
  message.content = content;
  await message.save();

  const updated = await Message.findById(id)
    .populate('sender',   'fullName email')
    .populate('receiver', 'fullName email');

  return res.status(200).json(
    new ApiResponse(200, updated, 'Notification updated successfully')
  );
});

export {
  getAllNotifications,
  getNotificationById,
  sendNotification,
  deleteNotification,
  updateNotification
};
