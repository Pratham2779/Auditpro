// services/notification.service.js

import axiosInstance from './axios';
import { toast } from 'react-hot-toast';

/**
 * Fetch notifications with optional query params:
 *   - send:     'true' | 'false'
 *   - received: 'true' | 'false'
 *   - search:   string
 *   - date:     YYYY-MM-DD
 *
 * Returns: { count, data: [notifications] }
 */
const getAllNotifications = async (queryParams = {}) => {
  try {
    const query = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/notification?${query}`);

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch notifications');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Could not fetch notifications'
    );
    throw error;
  }
};

/**
 * Fetch a single notification by ID
 *
 * Returns: notification object
 */
const getNotificationById = async (id) => {
  try {
    const response = await axiosInstance.get(`/notification/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Notification not found');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Error fetching notification'
    );
    throw error;
  }
};

/**
 * Send a new notification.
 * Body: { receiver: ObjectId, subject?: string, content: string }
 *
 * Returns: created notification
 */
const sendNotification = async (formData) => {
  try {
    const response = await axiosInstance.post('/notification/send', formData);
    if (response.data.success) {
      toast.success(response.data.message || 'Notification sent');
      return response.data.data;
    }
    throw new Error(response.data.message || 'Send notification failed');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Create notification failed'
    );
    throw error;
  }
};

/**
 * Update an existing notification.
 * Body: { subject?: string, content: string }
 *
 * Returns: updated notification
 */
const updateNotification = async (id, formData) => {
  try {
    const response = await axiosInstance.put(`/notification/update/${id}`, formData);
    if (response.data.success) {
      toast.success(response.data.message || 'Notification updated');
      return response.data.data;
    }
    throw new Error(response.data.message || 'Update notification failed');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Update notification failed'
    );
    throw error;
  }
};

/**
 * Delete a notification by ID
 *
 * Returns: {}
 */
const deleteNotification = async (id) => {
  try {
    const response = await axiosInstance.delete(`/notification/delete/${id}`);
    if (response.data.success) {
      toast.success(response.data.message || 'Notification deleted');
      return response.data.data;
    }
    throw new Error(response.data.message || 'Delete notification failed');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Delete notification failed'
    );
    throw error;
  }
};

export {
  getAllNotifications,
  getNotificationById,
  sendNotification,
  updateNotification,
  deleteNotification
};
