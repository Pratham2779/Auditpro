
import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar, FileText, MapPin, User, Upload,
  Plus, Edit3, Trash2, CheckCircle, Clock, AlertCircle, Eye
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

import {
  fetchTodaysAssignedAudits,
  createAssignedAudit,
  updateAssignedAudit,
  deleteAssignedAudit,
} from '../../slices/assignAudit.slice.js';

import { fetchAuditors } from '../../slices/auditor.slice.js';
import { fetchCounter } from '../../slices/counter.silce.js';
import { useNavigate } from 'react-router-dom';


export default function AssignAudits() {
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const navigate=useNavigate();

  const { todaysAudit: audits, error } = useSelector(s => s.assignAudit);
  const { allAuditors } = useSelector(s => s.auditor);
  const { allCounter } = useSelector(s => s.counter);
  const loading=useSelector((state)=>state.assignAudit.loading);

  const [formData, setFormData] = useState({
    auditorId: '',
    counterId: '',
    auditDate: '',
    remark: '',
    auditFile: null,
  });

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingAuditId, setDeletingAuditId] = useState(null);
  

  useEffect(() => {
    
    dispatch(fetchAuditors());
    dispatch(fetchCounter());
    dispatch(fetchTodaysAssignedAudits());
  
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleInputChange = e => {
    const { name, value, files } = e.target;
    if (name === 'auditFile') {
      setFormData(f => ({ ...f, auditFile: files[0] }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = () => {
    const { auditorId, counterId, auditDate, auditFile, remark } = formData;
    const trimmedRemark = remark.trim();

    // Validation
    if (!auditorId || !counterId || !auditDate.trim()) {
      return toast.error('Please fill all required fields.');
    }
    if (!editingId && !auditFile) {
      return toast.error('CSV file is required when assigning a new audit.');
    }
    if (auditFile && !/\.(csv|xlsx)$/i.test(auditFile.name)) {
      return toast.error('Only CSV or XLSX files are allowed.');
    }

    const fd = new FormData();
    fd.append('auditorId', auditorId);
    fd.append('counterId', counterId);
    fd.append('auditDate', auditDate);
    fd.append('remark', trimmedRemark);
    if (auditFile) fd.append('auditFile', auditFile);

    setSubmitting(true);

    const action = editingId
      ? updateAssignedAudit({ id: editingId, formData: fd })
      : createAssignedAudit(fd);

    dispatch(action).then(res => {
      setSubmitting(false);
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success(editingId ? 'Audit Updated!' : 'Audit Assigned!');
        resetForm();
        dispatch(fetchTodaysAssignedAudits());
      } else {
        toast.error(res.payload?.message || 'Something went wrong.');
      }
    });
  };

  const handleEdit = (audit) => {
    setEditingId(audit._id);
    setFormData({
      auditorId: audit.auditor?._id || '',
      counterId: audit.counter?._id || '',
      auditDate: audit.auditDate?.slice(0, 10) || '',
      remark: audit.remark || '',
      auditFile: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleDelete = (audit) => {
    if (!window.confirm('Delete this audit?')) return;
    setDeletingAuditId(audit._id);
    dispatch(deleteAssignedAudit(audit._id)).then(res => {
      setDeletingAuditId(null);
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Audit Deleted!');
        dispatch(fetchTodaysAssignedAudits());
      }
    });
    resetForm();
  };


  const handleView=async (log)=>{
    
     navigate(`/admin/adminAuditOverview`,{state:{auditLog:log}}); 
  }



  const resetForm = () => {
    setFormData({
      auditorId: '',
      counterId: '',
      auditDate: '',
      remark: '',
      auditFile: null,
    });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const getStatusColor = status => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'disapproved': return 'bg-red-100 text-red-800';
      case 'audited': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'audited': return <Clock className="w-4 h-4" />;
      case 'disapproved': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-base">Loading assign audit section...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="py-8 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800">Audit Management System</h1>
        <p className="text-gray-600">Assign and manage audit logs</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>{editingId ? 'Edit Assigned Audit' : 'New Audit Assignment'}</span>
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Auditor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Auditor</span>
              </label>
              <select name="auditorId" value={formData.auditorId} onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <option value="">Choose Auditor</option>
                {allAuditors.map(a => <option key={a._id} value={a._id}>{a.fullName}</option>)}
              </select>
            </div>

            {/* Counter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Counter</span>
              </label>
              <select name="counterId" value={formData.counterId} onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <option value="">Choose Counter</option>
                {allCounter.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.counterNumber}) — {c.location}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Date</span>
              </label>
              <input type="date" name="auditDate" value={formData.auditDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50" />
            </div>

            {/* File */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Upload CSV</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                name="auditFile"
                onChange={handleInputChange}
                accept=".csv,.xlsx"
                className="w-full file:py-2 file:px-4 file:bg-blue-600 file:text-white file:rounded-lg"
              />
              <span className="text-sm text-gray-600 block">
                {formData.auditFile ? `Selected: ${formData.auditFile.name}` : 'No file selected'}
              </span>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Remarks</span>
              </label>
              <textarea name="remark" rows="3" value={formData.remark} onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 resize-none" />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-6 py-3 rounded-xl font-semibold text-white ${submitting ? 'bg-blue-400' : 'bg-blue-600'}`}
              >
                {submitting ? (editingId ? 'Updating...' : 'Assigning...') : (editingId ? 'Update Audit' : 'Assign Audit')}
              </button>
              {editingId && (
                <button onClick={resetForm}
                  className="text-gray-600 underline text-sm">
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AUDIT LIST */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" /><span>Assigned Audits</span>
            </h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{audits.length} Total</span>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto space-y-4">
            {audits.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No audits assigned today.</p>
            ) : (
              audits.map(audit => {
                const auditorName = audit.auditor?.fullName || 'Unknown';
                const avatarUrl = audit.auditor?.avatar?.url || null;
                const counter = audit.counter?.name || 'Unknown';

                return (
                  <div key={audit._id} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar"
                            className="w-15 h-15 rounded-full object-cover border border-blue-400" />
                        ) : (
                          <div className="w-15 h-15 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white flex items-center justify-center font-bold">
                            {auditorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-800">{auditorName}</h3>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.auditStatus)}`}>
                            {getStatusIcon(audit.auditStatus)}
                            <span className="capitalize">{audit.auditStatus}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="View Audit"
                         onClick={()=>handleView(audit)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(audit)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Audit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          disabled={deletingAuditId === audit._id}
                          onClick={() => handleDelete(audit)}
                          className={`p-2 rounded-lg ${deletingAuditId === audit._id ? 'text-gray-400' : 'text-red-600 hover:bg-red-50'}`}
                          title="Delete Audit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-gray-400" /> <span>{counter}</span></div>
                      <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /> <span>{new Date(audit.auditDate).toLocaleDateString()}</span></div>
                    </div>
                    {audit.remark && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                        {audit.remark}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
