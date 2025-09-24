import { useState } from 'react';
import {
  FiClipboard,
  FiUser,
  FiUsers,
  FiMapPin,
  FiCheck,
  FiX,
  FiBarChart2,
  FiDownload,
  FiFileText,
  FiPlus,
  FiAlertCircle,
  FiTag,
  FiSearch,
  FiMail,
  FiHash,
  FiCalendar,
  FiEye,
  FiTrendingUp
} from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { updateAuditlog } from '../../services/auditlog.service';
import toast from 'react-hot-toast';

export default function AdminAuditOverview() {
  // Helper function to convert Excel date to readable format

  const state = useLocation();
  const auditLog = state.state.auditLog;

  const convertExcelDate = (excelDate) => {
    if (!excelDate) return 'N/A';
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Process audit data from the log
  const processAuditData = () => {
    if (!auditLog) {
      // Return dummy data if no log provided
      return {
        auditor: {
          name: 'Arvind Shah',
          email: 'arvind.shah@goldjewels.com',
          id: 'AUD-2025-001'
        },
        salesman: {
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@goldjewels.com',
          id: 'SM-456'
        },
        counter: {
          name: 'Gold Counter A',
          number: '#GC-001',
          location: 'Mumbai Central Branch, Maharashtra',
          date: 'June 18, 2025',
          auditTime: '10:30 AM - 4:15 PM'
        },
        summary: { matched: 3, unmatched: 3, missing: 30, total: 36 },
        matchedItems: [],
        unmatchedItems: [],
        missingItems: [],
        remark: ''
      };
    }

    const { auditFile, auditor, salesman, counter, remark, auditDate, createdAt } = auditLog;

    // Process matched items
    const matchedItems = auditFile?.matchedItems ? Object.entries(auditFile.matchedItems).map(([key, item]) => ({
      id: key,
      name: `${item.primarygroup} Item`,
      weight: item.weight ? `${item.weight}g` : 'N/A',
      category: item.primarygroup || 'Unknown',
      value: item.rate ? `₹${(item.rate * (item.weight || 1)).toLocaleString('en-IN')}` : 'N/A',
      date: convertExcelDate(item.date),
      srno: item.srno
    })) : [];

    // Process unmatched items (scanned but not in file)
    const unmatchedItems = auditFile?.unmatchedItems ? Object.entries(auditFile.unmatchedItems).map(([key, item]) => ({
      id: key,
      name: `Item ${key}`,
      issue: 'Not in inventory file',
      severity: 'high',
      weight: 'N/A',
      scannedAt: new Date(item.scannedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    })) : [];

    // Process missing items (in file but not scanned)
    const missingItems = auditFile?.missingItems ? Object.entries(auditFile.missingItems).map(([key, item]) => ({
      id: key,
      name: `${item.primarygroup} Item`,
      lastSeen: convertExcelDate(item.date),
      value: item.rate ? `₹${(item.rate * (item.weight || 1)).toLocaleString('en-IN')}` : 'N/A',
      location: `Serial: ${item.srno}`,
      weight: item.weight ? `${item.weight}g` : 'N/A',
      category: item.primarygroup || 'Unknown'
    })) : [];

    return {
      auditor: {
        name: auditor?.fullName || 'Unknown Auditor',
        email: auditor?.email || 'N/A',
        id: auditor?._id?.slice(-8) || 'N/A'
      },
      salesman: {
        name: salesman?.fullName || 'Unknown Salesman',
        email: salesman?.email || 'N/A',
        id: salesman?._id?.slice(-8) || 'N/A'
      },
      counter: {
        name: counter?.name || 'Unknown Counter',
        number: `#${counter?.counterNumber || 'N/A'}`,
        location: counter?.location || 'Unknown Location',
        date: formatDate(auditDate),
        auditTime: `${formatTime(createdAt)} - ${formatTime(auditLog.updatedAt)}`
      },
      summary: {
        matched: matchedItems.length,
        unmatched: unmatchedItems.length,
        missing: missingItems.length,
        total: (auditFile?.parsedJson?.length || 0)
      },
      matchedItems,
      unmatchedItems,
      missingItems,
      remark: remark || ''
    };
  };

  const auditData = processAuditData();
  const [remarks, setRemarks] = useState(auditData.remark ? [auditData.remark] : []);
  const [newRemark, setNewRemark] = useState('');
  const [activeTab, setActiveTab] = useState('matched');

  const handleAddRemark = () => {
    if (!newRemark.trim()) return;
    setRemarks([...remarks, newRemark.trim()]);
    setNewRemark('');
  };


  const downloadPDFReport = () => {
    if (auditLog?.reportFile?.downloadUrl) {
      window.open(auditLog.reportFile.downloadUrl, '_blank');
    } else {
      console.log('PDF Report not available');
      toast.error('PDF Report not avaliable');
    }
  };

  const downloadAuditFile = () => {
    if (auditLog?.auditFile?.downloadUrl) {
      window.open(auditLog.auditFile.downloadUrl, '_blank');
    } else {
      console.log('Audit file not available');
      toast.error('Audit file not avaliable');
    }
  };

  const handleApprove=async ()=>{
    if(auditLog.auditStatus=='pending'){
      toast.error('Audit is not audited');
      return;
    }
    try {
      await updateAuditlog(auditLog._id,{auditStatus:'approved'});
    } catch (error) {
      console.log("failed to update status",error);
      toast.error('failed to update status');
    }
  }
  const handleDisapprove=async ()=>{
    if(auditLog.auditStatus=='pending'){
      toast.error('Audit is not audited');
      return;
    }
     try {
      await updateAuditlog(auditLog._id,{auditStatus:'disapproved'});
    } catch (error) {
      console.log("failed to update status",error);
      toast.error('failed to update status');
    }

  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const TabButton = ({ id, label, count, color, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === id
          ? `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg transform scale-105`
          : `bg-${color}-50 text-${color}-700 hover:bg-${color}-100 border border-${color}-200`
        }`}
    >
      <Icon className="text-sm" />
      <span className="text-sm font-semibold">{label}</span>
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTab === id ? 'bg-white bg-opacity-30' : 'bg-white'
        }`}>
        {count}
      </span>
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'matched':
        return (
          <div className="space-y-3">
            {auditData.matchedItems.length > 0 ? auditData.matchedItems.map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-green-800 text-sm">{item.id}</span>
                      <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-green-700 mb-1">{item.name}</p>
                    <div className="flex gap-4 text-xs text-green-600">
                      <span>Weight: {item.weight}</span>
                      <span>Value: {item.value}</span>
                      <span>Date: {item.date}</span>
                      <span>Sr.No: {item.srno}</span>
                    </div>
                  </div>
                  <div className="bg-green-500 text-white p-2 rounded-lg">
                    <FiCheck className="text-sm" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <FiCheck className="mx-auto text-4xl mb-2 opacity-50" />
                <p>No matched items found</p>
              </div>
            )}
          </div>
        );
      case 'unmatched':
        return (
          <div className="space-y-3">
            {auditData.unmatchedItems.length > 0 ? auditData.unmatchedItems.map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-red-800 text-sm">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-red-700 mb-1">{item.name}</p>
                    <div className="flex gap-4 text-xs text-red-600">
                      <span>Issue: {item.issue}</span>
                      <span>Scanned at: {item.scannedAt}</span>
                    </div>
                  </div>
                  <div className="bg-red-500 text-white p-2 rounded-lg">
                    <FiAlertCircle className="text-sm" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <FiX className="mx-auto text-4xl mb-2 opacity-50" />
                <p>No unmatched items found</p>
              </div>
            )}
          </div>
        );
      case 'missing':
        return (
          <div className="space-y-3">
            {auditData.missingItems.length > 0 ? auditData.missingItems.map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-yellow-800 text-sm">{item.id}</span>
                      <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        MISSING ({item.category})
                      </span>
                    </div>
                    <p className="text-sm font-medium text-yellow-700 mb-1">{item.name}</p>
                    <div className="flex gap-4 text-xs text-yellow-600">
                      <span>Last record: {item.lastSeen}</span>
                      <span>Weight: {item.weight}</span>
                      <span>Value: {item.value}</span>
                    </div>
                  </div>
                  <div className="bg-yellow-500 text-white p-2 rounded-lg">
                    <FiSearch className="text-sm" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <FiSearch className="mx-auto text-4xl mb-2 opacity-50" />
                <p>No missing items found</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <FiClipboard className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Audit Overview
          </h1>
          <p className="text-lg text-gray-600">audit results and verification summary</p>
        </div>

        {/* Enhanced Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl border-0 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <FiUser className="text-purple-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{auditData.auditor.name}</h3>
                <p className="text-purple-600 font-medium text-sm mb-2">Lead Auditor</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMail className="text-xs" />
                    <span>{auditData.auditor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiHash className="text-xs" />
                    <span>{auditData.auditor.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-0 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <FiUsers className="text-emerald-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{auditData.salesman.name}</h3>
                <p className="text-emerald-600 font-medium text-sm mb-2">Sales Manager</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMail className="text-xs" />
                    <span>{auditData.salesman.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiHash className="text-xs" />
                    <span>{auditData.salesman.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-0 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <FiMapPin className="text-orange-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{auditData.counter.name}</h3>
                <p className="text-orange-600 font-medium text-sm mb-2">{auditData.counter.number}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMapPin className="text-xs" />
                    <span className="text-xs">{auditData.counter.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCalendar className="text-xs" />
                    <span>{auditData.counter.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiTrendingUp className="text-xs" />
                    <span>{auditData.counter.auditTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Summary Stats Strip */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <FiBarChart2 className="text-indigo-600 text-2xl" />
              Audit Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4 group-hover:bg-green-200 transition-colors duration-200">
                <FiCheck className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{auditData.summary.matched}</p>
                <p className="text-sm text-gray-600 font-medium">Items Matched</p>
              </div>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4 group-hover:bg-red-200 transition-colors duration-200">
                <FiX className="text-red-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{auditData.summary.unmatched}</p>
                <p className="text-sm text-gray-600 font-medium">Unmatched</p>
              </div>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-2xl mb-4 group-hover:bg-yellow-200 transition-colors duration-200">
                <FiSearch className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{auditData.summary.missing}</p>
                <p className="text-sm text-gray-600 font-medium">Missing Items</p>
              </div>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                <FiBarChart2 className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{auditData.summary.total}</p>
                <p className="text-sm text-gray-600 font-medium">Total Items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Items Section - Takes 3/4 width */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b">
                <h3 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                  <FiEye className="text-indigo-600" />
                  Audit Items Details
                </h3>
                <div className="flex gap-4 flex-wrap">
                  <TabButton
                    id="matched"
                    label="Matched"
                    count={auditData.summary.matched}
                    color="green"
                    icon={FiCheck}
                  />
                  <TabButton
                    id="unmatched"
                    label="Unmatched"
                    count={auditData.summary.unmatched}
                    color="red"
                    icon={FiX}
                  />
                  <TabButton
                    id="missing"
                    label="Missing"
                    count={auditData.summary.missing}
                    color="blue"
                    icon={FiSearch}
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="h-96 overflow-y-auto">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar - Takes 1/4 width */}
          <div className="space-y-6">

            {/* Remarks Section */}
            <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FiFileText className="text-indigo-600" />
                  Audit Remarks
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {remarks.map((remark, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{remark}</p>
                  </div>
                ))}
                <div className="space-y-3 pt-2 border-t">
                  <textarea
                    value={newRemark}
                    onChange={(e) => setNewRemark(e.target.value)}
                    className="w-full h-16 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Add your audit remark..."
                  />
                  <button
                    onClick={handleAddRemark}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FiPlus className="text-sm" />
                    Add Remark
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}

            <div className="bg-white rounded-2xl shadow-xl border-0 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Actions</h3>

              {/* Download Options */}
              <div className="space-y-3">
                <button
                  onClick={downloadPDFReport}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-cyan-700 flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiFileText className="text-lg" />
                  Download PDF Report
                </button>

                <button
                  onClick={downloadAuditFile}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-600 hover:to-indigo-700 flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiDownload className="text-lg" />
                  Download Audit File
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleApprove}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiCheck className="text-lg" />
                  Approve
                </button>

                <button
                  onClick={handleDisapprove}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-rose-700 flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiX className="text-lg" />
                  Disapprove
                </button>
              </div>
            </div>



          </div>
        </div>
      </div>
    </div>
  );
}