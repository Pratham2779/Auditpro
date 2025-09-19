import axiosInstance from "./axios"; 
import { toast } from 'react-hot-toast';









const createUser = async (formData) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'POST',
      url: '/user/create',
      data: formData,
    });

    console.log("USER_CREATE_API RESPONSE:", response);

    if (response.data.success) {
      toast.success(response.data.message || "User created successfully");
      result = response.data.data; 
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("USER_CREATE_API ERROR:", error);

    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "User creation failed"
    );

    result = error?.response?.data || { message: error.message }; 
  }

  return result;

};



const getAllUsers = async (queryParams) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'GET',
      url: '/user/',
      params:queryParams,
    });

    console.log("USER_GET_ALL_API RESPONSE:", response);

    if (response.data.success) {
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("USER_GET_ALL_API ERROR:", error);

    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch users"
    );

    result = error?.response?.data || { message: error.message };
  }

  return result;
};





const getUserById = async (userId) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'GET',
      url: `/user/${userId}`,
    });

    console.log("USER_GET_BY_ID_API RESPONSE:", response);

    if (response.data.success) {
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("USER_GET_BY_ID_API ERROR:", error);

    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Failed to fetch user details"
    );

    result = error?.response?.data || { message: error.message };
  }

  return result;
};





const updateUser = async (userId, formData) => {
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'PUT',
      url: `/user/update/${userId}`,
      data: formData,
    });

    console.log("USER_UPDATE_API RESPONSE:", response);

    if (response.data.success) {
      toast.success(response.data.message || "User updated successfully");
      result = response.data.data;
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("USER_UPDATE_API ERROR:", error);

    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "User update failed"
    );

    result = error?.response?.data || { message: error.message };
  }

  return result;
};






const deleteUser = async (userId) => {

  let result = null;

  try {
    const response = await axiosInstance({
      method: 'DELETE',
      url: `/user/delete/${userId}`,
    });

    console.log("USER_DELETE_API RESPONSE:", response);

    if (response.data.success) {

      toast.success(response.data.message || "User deleted successfully");
      result = response.data.data;
      
    } else {
      throw new Error(response.data.message || "Something went wrong");
    }
  } catch (error) {
    console.error("USER_DELETE_API ERROR:", error);

    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "User deletion failed"
    );

    result = error?.response?.data || { message: error.message };
  }

  return result;
};

export { createUser, getAllUsers, getUserById, updateUser, deleteUser };
