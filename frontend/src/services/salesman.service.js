import axiosInstance from "./axios";
import { toast } from 'react-hot-toast';


const createSalesman = async (formData) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'POST',
      url: '/salesman/create',
      data: formData,
    });

    console.log("SALESMAN_CREATE_API RESPONSE:", response);

    if (response.data.success) {
      toast.success(response.data.message || "Salesman created successfully");
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("SALESMAN_CREATE_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Salesman creation failed"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};




const getAllSalesman = async (queryParams = {}) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'GET',
      url: '/salesman',
      params: queryParams,
    });

    console.log("SALESMAN_GET_ALL_API RESPONSE:", response);

    if (response.data.success) {
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("SALESMAN_GET_ALL_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch salesmen"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};




const getSalesmanById = async (salesmanId) => {
  let result = null;

  try {

    const response = await axiosInstance({
      method: 'GET',
      url: `/salesman/${salesmanId}`,
    });

    console.log("SALESMAN_GET_BY_ID_API RESPONSE:", response);

    if (response.data.success) {
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("SALESMAN_GET_BY_ID_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch salesman details"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};




const updateSalesman = async (salesmanId, formData) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'PUT',
      url: `/salesman/update/${salesmanId}`,
      data: formData,
    });

    console.log("SALESMAN_UPDATE_API RESPONSE:", response);

    if (response.data.success) {
      toast.success(response.data.message || "Salesman updated successfully");
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("SALESMAN_UPDATE_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Salesman update failed"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};



const deleteSalesman = async (salesmanId) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'DELETE',
      url: `/salesman/delete/${salesmanId}`,
    });

    console.log("SALESMAN_DELETE_API RESPONSE:", response);

    if (response.data.success) {
      toast.success(response.data.message || "Salesman deleted successfully");
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("SALESMAN_DELETE_API ERROR:", error);
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Salesman deletion failed"
    );
    result = error?.response?.data || { message: error.message };
  }

  return result;
};

export { createSalesman, getAllSalesman, getSalesmanById, updateSalesman, deleteSalesman };
