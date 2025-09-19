

// import fs from 'fs';
// import path from 'path';
// import cloudinary from '../configs/cloudinary/index.js';


// const sanitizeFilename = (filename) => {
  
//   return filename
//     .replace(/[^a-zA-Z0-9\-._]/g, '_')  
//     .replace(/_+/g, '_')                 
//     .replace(/_\./g, '.')               
//     .replace(/^_+|_+$/g, '');            
// };

// export const uploadToCloudinary = async (localFilePath, folder, resourceType = 'auto') => {
//   try {
   
//     if (!localFilePath || !fs.existsSync(localFilePath)) {
//       throw new Error('File path is missing or invalid');
//     }

   
//     const result = await cloudinary.uploader.upload(localFilePath, {
//       folder,
//       resource_type: resourceType,
//       type: 'upload',
//     });

   
//     fs.unlinkSync(localFilePath);

    
//     const safeFilename = sanitizeFilename(result.original_filename);

//     const downloadUrl = cloudinary.url(result.public_id, {
//       secure: true,
//       resource_type: result.resource_type,
//       type: 'upload',
//       version: result.version,
//       flags: `attachment:${safeFilename}`
//     });

//     return {
//       url: result.secure_url,      
//       downloadUrl,                 
//       public_id: result.public_id,
//       original_filename: result.original_filename,
//     };
//   } catch (err) {
    
//     if (localFilePath && fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }
//     throw new Error('Cloudinary upload failed: ' + err.message);
//   }
// };















import fs from 'fs';
import path from 'path';
import cloudinary from '../configs/cloudinary/index.js';

const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9\-._]/g, '_')  // Replace invalid characters
    .replace(/_+/g, '_')                // Collapse multiple underscores
    .replace(/_\./g, '.')               // Remove trailing underscore before dot
    .replace(/^_+|_+$/g, '');           // Trim underscores at start/end
};

export const uploadToCloudinary = async (localFilePath, folder, resourceType = 'auto') => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      throw new Error('File path is missing or invalid');
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: resourceType,
      type: 'upload',
    });

  
    try {
      await fs.promises.unlink(localFilePath);
    } catch (unlinkErr) {
      console.warn('Warning: Failed to delete local file:', unlinkErr.message);
    }

    const safeFilename = sanitizeFilename(result.original_filename);

    const downloadUrl = cloudinary.url(result.public_id, {
      secure: true,
      resource_type: result.resource_type,
      type: 'upload',
      version: result.version,
      flags: `attachment:${safeFilename}`
    });

    return {
      url: result.secure_url,
      downloadUrl,
      public_id: result.public_id,
      original_filename: result.original_filename,
    };
  } catch (err) {
    // Fallback delete in case upload fails
    try {
      if (localFilePath && fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
      }
    } catch (cleanupErr) {
      console.warn('Cleanup warning (on error):', cleanupErr.message);
    }

    throw new Error('Cloudinary upload failed: ' + err.message);
  }
};
