import axiosInstance from "./axios";
import { toast } from 'react-hot-toast';


// ===================== LOGIN USER =====================
const loginUser = async (formData) => {
  const toastId = toast.loading("Logging in...");
  let result = null;

  try {
    const response = await axiosInstance({
      method: 'POST',
      url: '/auth/login',
      data: formData,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Login successful");
    result = response.data.data;

  } catch (error) {
    console.error("LOGIN_API ERROR:", error);

    toast.error(
      error?.response?.data?.message ||
      error.message ||
      "Login failed"
    );

    result = error?.response?.data;
  }

  toast.dismiss(toastId);
  return result;
};


// ===================== LOGOUT USER =====================
const logoutUser = async () => {
  const toastId = toast.loading("Logging out...");
  let result = null;

  try {
    const response = await axiosInstance({
      method: "POST",
      url: "/auth/logout",
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Logged out successfully");
    result = true;

    localStorage.removeItem("token"); // optional, if you store tokens

  } catch (error) {
    console.error("LOGOUT_API ERROR:", error);
    toast.error(error?.response?.data?.message || error.message || "Logout failed");
    result = false;
  }

  toast.dismiss(toastId);
  return result;
};


// ===================== GET CURRENT USER =====================
const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data.data;

  } catch (error) {
    console.error("GET USER ERROR:", error);
    return null;
  }
};


// ===================== VERIFY EMAIL (SEND OTP) =====================
const verifyEmail = async () => {
  const toastId = toast.loading("Sending verification email...");
  try {
    const response = await axiosInstance.post('/auth/verify-email');

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "OTP sent successfully");
    return true;

  } catch (error) {
    console.error("VERIFY_EMAIL ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to send OTP");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};


// ===================== RESET PASSWORD USING OTP =====================
const resetPassword = async ({ otp, newPassword }) => {
  const toastId = toast.loading("Resetting password...");
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      otp,
      newPassword,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Password reset successfully");
    return true;

  } catch (error) {
    console.error("RESET_PASSWORD ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to reset password");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};




const verifyEmailExternal = async (formData) => {
  const toastId = toast.loading("Sending verification email...");

  try {
    const response = await axiosInstance.post('/auth/verify-email-external', formData);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "OTP sent successfully");
    return true;

  } catch (error) {
    console.error("VERIFY_EMAIL_EXTERNAL ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to send OTP");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};





const resetPasswordExternal = async (formData) => {
  const toastId = toast.loading("Resetting password...");

  try {
    const response = await axiosInstance.post('/auth/reset-password-external', formData);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success(response.data.message || "Password changed successfully");
    return true;

  } catch (error) {
    console.error("RESET_PASSWORD_EXTERNAL ERROR:", error);
    toast.error(error?.response?.data?.message || "Failed to reset password");
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};












export {
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resetPassword,
  verifyEmailExternal,
  resetPasswordExternal
};
