import axiosInstance from './axios';
import { toast } from 'react-hot-toast';


const getAllAuditlogs = async (queryParams = {}) => {
  try {
    const query = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/auditlog?${query}`);
    
    if (response.data.success) {
      return response.data.data; // { auditLogs, total, currentPage, totalPages }
    }

    throw new Error(response.data.message || 'Failed to fetch audit logs');

  } catch (error) {
    toast.error(
      error?.response?.data?.message || error.message || "Could not fetch audit logs"
    );
    throw error;
  }
};


const getAuditlogById = async (id) => {
  try {
    const response = await axiosInstance.get(`/auditlog/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Audit log not found');
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || 'Error fetching audit log');
    throw error;
  }
};


const createAuditlog = async (formData) => {
  try {
    const response = await axiosInstance.post('/auditlog/create', formData);

    if (response.data.success) {
      toast.success(response.data.message || 'Audit log created');
      return response.data.data;
    }

    throw new Error(response.data.message || 'Audit creation failed');

  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || 'Create audit failed');
    throw error;
  }
};


const updateAuditlog = async (id, formData) => {
  try {
    const response = await axiosInstance.put(`/auditlog/update/${id}`, formData);

    if (response.data.success) {
      toast.success(response.data.message || 'Audit log updated');
      return response.data.data;
    }

    throw new Error(response.data.message || 'Update failed');

  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || 'Update failed');
    throw error;
  }
};



const deleteAuditlog = async (id) => {
  try {
    const response = await axiosInstance.delete(`/auditlog/delete/${id}`);
    
    if (response.data.success) {
      toast.success(response.data.message || 'Audit log deleted');
      return response.data.data;
    }

    throw new Error(response.data.message || 'Delete failed');

  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || 'Delete failed');
    throw error;
  }
};



export {
  getAllAuditlogs,
  getAuditlogById,
  deleteAuditlog,
  updateAuditlog,
  createAuditlog
}