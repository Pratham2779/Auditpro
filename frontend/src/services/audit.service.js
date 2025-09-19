// // services/auditlog.service.js
// import axiosInstance from './axios';
// import { toast } from 'react-hot-toast';

// const scanItem = async ({ auditLogId, cpcnumber }) => {
//   try {
//     const response = await axiosInstance.post('/auditing/scanItem', {
//       auditLogId,
//       cpcnumber
//     });

//     if (response.data.success) {
//       toast.success(response.data.message || 'Item match processed');
//       return response.data.data;
//     }
//     throw new Error(response.data.message || 'Match request failed');
//   } catch (error) {
//     toast.error(
//       error?.response?.data?.message ||
//       error.message ||
//       'Failed to match item'
//     );
//     throw error;
//   }
// };

// const setSalesman = async ({ auditLogId, salesmanId }) => {
//   try {
//     const response = await axiosInstance.post('/auditing/setSalesman', {
//       id: auditLogId,
//       salesmanId
//     });
//     if (response.data.success) {
//       toast.success(response.data.message || 'Salesman set');
//       return response.data.data;
//     }
//     throw new Error(response.data.message || 'Salesman setting failed');
//   } catch (error) {
//     toast.error(
//       error?.response?.data?.message ||
//       error.message ||
//       'Failed to set Salesman'
//     );
//     throw error;
//   }
// };

// const createReport = async (auditLogId) => {
//   try {
//     const response = await axiosInstance.post(`/auditing/createReport/${auditLogId}`);
//     if (response.data.success) {
//       toast.success(response.data.message || 'Report generated');
//       return response.data.data;
//     }
//     throw new Error(response.data.message || 'Report generation failed');
//   } catch (error) {
//     toast.error(
//       error?.response?.data?.message ||
//       error.message ||
//       'Failed to generate report'
//     );
//     throw error;
//   }
// };


// const resetAuditLog = async ({ auditLogId }) => {
//   try {
  
//     const response = await axiosInstance.post(`/auditing/resetAuditing/${auditLogId}`);
//     if (response.data.success) {
//       toast.success(response.data.message || 'Audit log reset successfully');
//       return response.data.data;
//     }
//     throw new Error(response.data.message || 'Reset audit log failed');
//   } catch (error) {
//     toast.error(
//       error?.response?.data?.message ||
//       error.message ||
//       'Failed to reset audit log'
//     );
//     throw error;
//   }
// };



// export {
//   scanItem,
//   resetAuditLog,
//   createReport,
//   setSalesman
// }

















// services/auditlog.service.js
import axiosInstance from './axios';
import { toast } from 'react-hot-toast';

// Scan item to check if it matches
const scanItem = async ({ auditLogId, cpcnumber }) => {
  try {
    const response = await axiosInstance.post('/audit/scanItem', {
      auditLogId,
      cpcnumber
    });

    if (response.data.success) {
      toast.success(response.data.message || 'Item match processed');
      return response.data.data;
    }
    throw new Error(response.data.message || 'Match request failed');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Failed to match item'
    );
    throw error;
  }
};

// Set the salesman for the audit
const setSalesman = async ({ auditLogId, salesmanId }) => {
  try {
    const response = await axiosInstance.post('/audit/setSalesman', {
      id: auditLogId,
      salesmanId
    });
    if (response.data.success) {
      toast.success(response.data.message || 'Salesman set');
      return response.data.data;
    }
    throw new Error(response.data.message || 'Salesman setting failed');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Failed to set Salesman'
    );
    throw error;
  }
};

// Create report for an audit log
const createReport = async (auditLogId) => {
  try {
    const response = await axiosInstance.post(`/audit/createReport/${auditLogId}`);
    if (response.data.success) {
      toast.success(response.data.message || 'Report generated');
      return response.data.data;
    }
    throw new Error(response.data.message || 'Report generation failed');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Failed to generate report'
    );
    throw error;
  }
};

// Reset the entire audit log
const resetAuditLog = async ({ auditLogId }) => {
  try {
    const response = await axiosInstance.post(`/audit/resetAudit/${auditLogId}`);
    if (response.data.success) {
      toast.success(response.data.message || 'Audit log reset successfully');
      return response.data.data;
    }
    throw new Error(response.data.message || 'Reset audit log failed');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Failed to reset audit log'
    );
    throw error;
  }
};

// Remove item from matched/unmatched/missing list
const removeItem = async ({ auditLogId, cpcnumber }) => {
  try {
    
    const response = await axiosInstance.delete('/audit/removeItem', 
      {
      data:{auditLogId,cpcnumber}
    });


    if (response.data.success) {
      toast.success(response.data.message || 'Item removed successfully');
      return response.data.data;
    }
    throw new Error(response.data.message || 'Remove item failed');
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error.message ||
      'Failed to remove item'
    );
    throw error;
  }
};



export {
  scanItem,
  resetAuditLog,
  createReport,
  setSalesman,
  removeItem,
};
