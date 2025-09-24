import axiosInstance from "./axios";
import { toast } from 'react-hot-toast';

const createCounter = async (formData) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'POST',
      url: '/counter/create',
      data: formData,
    });

    if (response.data.success) {

      toast.success(response.data.message || "Counter created successfully");
      result = response.data.data;

    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("COUNTER_CREATE_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Counter creation failed"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};




const getAllCounter = async (queryParams = {}) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'GET',
      url: '/counter',
      params: queryParams,
    });

    if (response.data.success) {
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("COUNTER_GET_ALL_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch counters"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};

const getCounterById = async (counterId) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'GET',
      url: `/counter/${counterId}`,
    });

    if (response.data.success) {
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("COUNTER_GET_BY_ID_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch counter details"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};

const updateCounter = async (counterId, formData) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'PUT',
      url: `/counter/update/${counterId}`,
      data: formData,
    });

    if (response.data.success) {
      toast.success(response.data.message || "Counter updated successfully");
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("COUNTER_UPDATE_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Counter update failed"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};

const deleteCounter = async (counterId) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'DELETE',
      url: `/counter/delete/${counterId}`,
    });

    if (response.data.success) {

      toast.success(response.data.message || "Counter deleted successfully");
      result = response.data.data;
      
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("COUNTER_DELETE_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Counter deletion failed"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};

export {
  createCounter,
  getAllCounter,
  getCounterById,
  updateCounter,
  deleteCounter
};
