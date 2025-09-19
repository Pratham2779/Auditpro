import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export const uploadAvatar = async (req, res) => {
  try {
    const result = await uploadToCloudinary(req.file.path, 'avatar', 'image');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadCSV = async (req, res) => {
  try {
    const result = await uploadToCloudinary(req.file.path, 'csv', 'raw');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadPDF = async (req, res) => {
  try {
    const result = await uploadToCloudinary(req.file.path, 'pdf', 'raw');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
