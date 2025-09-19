// import React, { useState, useEffect } from 'react';
// import { ClipboardDocumentCheckIcon, UserIcon, PlayIcon, StopIcon, DocumentArrowDownIcon, MagnifyingGlassIcon, ArrowLeftIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

// import getFormattedDate from '../../utils/getTodaysDate.js';
// import { getAllAuditlogs } from '../../services/auditlog.service.js';
// import { useSelector } from 'react-redux';
// import { fetchSalesman } from '../../slices/salesman.slice.js';

// export default function MyAudits() {
//   const [currentStep, setCurrentStep] = useState('auditList'); // auditList, salesman, audit

//   const [selectedAudit, setSelectedAudit] = useState(null);
//   const [selectedSalesman, setSelectedSalesman] = useState('');
//   const [cpcInput, setCpcInput] = useState('');
//   const [auditCompleted, setAuditCompleted] = useState(false);
//   const [matchedItems, setMatchedItems] = useState([]);
//   const [unmatchedItems, setUnmatchedItems] = useState([]);
//   const [startTime, setStartTime] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const currentUser = useSelector(state => state.auth.user);
//   const allSalesman = useSelector(state => state.salesman.allSalesman);
//   const [auditLogs, setAuditLogs] = useState([]);

//   // Mock data for audit logs - replace with actual API response
//   const mockAuditLogs = [
//     {
//       id: 1,
//       counterName: "Counter A - Main Hall",
//       counterNumber: "CNT001",
//       location: "Mumbai Branch",
//       adminName: "Rajesh Kumar",
//       auditStatus: "pending"
//     },
//   ];

//   // Mock salesman data with profile photos
//   const mockSalesmen = [
//     {
//       id: 1,
//       name: "Rajesh Kumar",
//       email: "rajesh.kumar@company.com",
//       profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
//     },
//   ];

//   const auditLogData = {
//     parsedJson: [
//       { cpc: "CPC001", name: "Gold Ring", category: "Rings" },
//       { cpc: "CPC002", name: "Silver Necklace", category: "Necklaces" },
//     ]
//   };

//   const fetchTodaysAudit = async () => {
//     try {
//       setLoading(true);
//       const queryParams = {
//         auditor: currentUser?._id,
//         auditDate: getFormattedDate()
//       };
//       const response = await getAllAuditlogs(queryParams);
//       // setAuditLogs(response.auditLogs);

//       // Set mock data for now - replace with actual API response
//       setAuditLogs(mockAuditLogs);
//     } catch (error) {
//       setError("Failed to fetch audits. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSalesman();
//   }, []);

//   useEffect(() => {
//     fetchTodaysAudit();
//   }, []);

//   const handleSelectAudit = (audit) => {
//     setSelectedAudit(audit);
//     setCurrentStep('salesman');
//     // Reset audit state
//     setSelectedSalesman('');
//     setCpcInput('');
//     setAuditCompleted(false);
//     setMatchedItems([]);
//     setUnmatchedItems([]);
//     setStartTime(null);
//   };

//   const handleStartAudit = () => {
//     if (!selectedSalesman) return;
//     setCurrentStep('audit');
//     setStartTime(new Date());
//   };

//   const handleCompleteAudit = () => {
//     setAuditCompleted(true);
//   };

//   const handleCancelAudit = () => {
//     setCurrentStep('salesman');
//     setCpcInput('');
//     setMatchedItems([]);
//     setUnmatchedItems([]);
//     setStartTime(null);
//     setAuditCompleted(false);
//   };

//   const handleCpcSubmit = (e) => {
//     e.preventDefault();
//     if (!cpcInput.trim() || auditCompleted) return;

//     const foundItem = auditLogData.parsedJson.find(item => item.cpc === cpcInput.trim());

//     if (foundItem) {
//       if (!matchedItems.find(item => item.cpc === foundItem.cpc)) {
//         setMatchedItems(prev => [...prev, foundItem]);
//       }
//     } else {
//       const newUnmatched = { cpc: cpcInput.trim(), name: "Unknown Item", category: "Unknown" };
//       if (!unmatchedItems.find(item => item.cpc === newUnmatched.cpc)) {
//         setUnmatchedItems(prev => [...prev, newUnmatched]);
//       }
//     }

//     setCpcInput('');
//   };

//   const handleDownloadReport = () => {
//     const selectedSalesmanData = mockSalesmen.find(s => s.id === parseInt(selectedSalesman));
//     const report = {
//       auditor: currentUser?.fullName,
//       date: getFormattedDate(),
//       salesman: selectedSalesmanData?.name,
//       salesmanEmail: selectedSalesmanData?.email,
//       counter: selectedAudit?.counterName,
//       counterNumber: selectedAudit?.counterNumber,
//       location: selectedAudit?.location,
//       adminName: selectedAudit?.adminName,
//       matchedCount: matchedItems.length,
//       unmatchedCount: unmatchedItems.length,
//       matchedItems,
//       unmatchedItems,
//       duration: startTime ? Math.round((new Date() - startTime) / 1000 / 60) : 0
//     };

//     const dataStr = JSON.stringify(report, null, 2);
//     const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
//     const exportFileDefaultName = `audit_report_${selectedAudit?.counterNumber}_${new Date().toISOString().split('T')[0]}.json`;

//     const linkElement = document.createElement('a');
//     linkElement.setAttribute('href', dataUri);
//     linkElement.setAttribute('download', exportFileDefaultName);
//     linkElement.click();
//   };

//   const handleBackToList = () => {
//     setCurrentStep('auditList');
//     setSelectedAudit(null);
//     setSelectedSalesman('');
//     setCpcInput('');
//     setAuditCompleted(false);
//     setMatchedItems([]);
//     setUnmatchedItems([]);
//     setStartTime(null);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'approved': return 'bg-green-50 border-green-200 text-green-800';
//       case 'audited': return 'bg-blue-50 border-blue-200 text-blue-800';
//       case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
//       case 'disapproved': return 'bg-red-50 border-red-200 text-red-800';
//       default: return 'bg-gray-50 border-gray-200 text-gray-800';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'approved': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
//       case 'audited': return <ClockIcon className="w-5 h-5 text-blue-600" />;
//       case 'pending': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
//       case 'disapproved': return <XMarkIcon className="w-5 h-5 text-red-600" />;
//       default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
//     }
//   };

//   // Calculate counts
//   const pendingCount = auditLogs.filter(log => log.auditStatus === 'pending').length;
//   const auditedCount = auditLogs.filter(log => log.auditStatus === 'audited').length;
//   const approvedCount = auditLogs.filter(log => log.auditStatus === 'approved').length;
//   const disapprovedCount = auditLogs.filter(log => log.auditStatus === 'disapproved').length;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading audits...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
//         <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
//           <div className="text-red-500 mb-4">
//             <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={fetchTodaysAudit}
//             className="bg-blue-500 text-white px-6 py-3 rounded-2xl hover:bg-blue-600 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-6xl mx-auto">
//         <header className="text-center mb-8">
//           <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
//             <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">
//             My Audits
//           </h1>
//           <p className="mt-2 text-gray-600">Manage your assigned inventory audits</p>
//         </header>

//         {/* Step 1: Audit List with Counts */}
//         {currentStep === 'auditList' && (
//           <div className="space-y-6">
//             {/* Statistics Cards */}
//             <div className="grid md:grid-cols-4 gap-6">
//               <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Pending</p>
//                     <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
//                   </div>
//                   <ExclamationTriangleIcon className="w-10 h-10 text-yellow-600" />
//                 </div>
//               </div>
//               <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Audited</p>
//                     <p className="text-3xl font-bold text-blue-600">{auditedCount}</p>
//                   </div>
//                   <ClockIcon className="w-10 h-10 text-blue-600" />
//                 </div>
//               </div>
//               <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Approved</p>
//                     <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
//                   </div>
//                   <CheckCircleIcon className="w-10 h-10 text-green-600" />
//                 </div>
//               </div>
//               <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Disapproved</p>
//                     <p className="text-3xl font-bold text-red-600">{disapprovedCount}</p>
//                   </div>
//                   <XMarkIcon className="w-10 h-10 text-red-600" />
//                 </div>
//               </div>
//             </div>

//             {/* Today's Audit Logs */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
//               <h2 className="text-2xl font-semibold text-gray-800 mb-6">Today's Audit Logs</h2>
//               <div className="space-y-4">
//                 {auditLogs.map((log) => (
//                   <div
//                     key={log.id}
//                     className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(log.auditStatus)}`}
//                     onClick={() => handleSelectAudit(log)}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-3 mb-3">
//                           {getStatusIcon(log.auditStatus)}
//                           <h3 className="text-lg font-semibold text-gray-900">{log.counterName}</h3>
//                           <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700">
//                             {log.counterNumber}
//                           </span>
//                         </div>

//                         <div className="grid md:grid-cols-2 gap-4 text-sm">
//                           <div className="space-y-2">
//                             <div className="flex items-center space-x-2">
//                               <span className="text-gray-600">Location:</span>
//                               <span className="font-medium">{log.location}</span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <span className="text-gray-600">Admin:</span>
//                               <span className="font-medium">{log.adminName}</span>
//                             </div>
//                           </div>
//                           <div className="space-y-2">
//                             <div className="flex items-center space-x-2">
//                               <span className="text-gray-600">Status:</span>
//                               <span className={`font-medium capitalize`}>
//                                 {log.auditStatus}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="ml-4">
//                         <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors">
//                           Select
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {auditLogs.length === 0 && (
//                 <div className="text-center py-12">
//                   <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-600 text-lg">No audit logs found</p>
//                   <p className="text-gray-500 text-sm">Check back later for new assignments</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Step 2: Salesman Selection */}
//         {currentStep === 'salesman' && selectedAudit && (
//           <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
//             <div className="flex items-center mb-6">
//               <button
//                 onClick={handleBackToList}
//                 className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
//               >
//                 <ArrowLeftIcon className="w-5 h-5" />
//               </button>
//               <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
//                 <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
//                 Select Salesman - {selectedAudit.counterName}
//               </h2>
//             </div>

//             <div className="grid md:grid-cols-2 gap-6 mb-8">
//               {mockSalesmen.map(salesman => (
//                 <div
//                   key={salesman.id}
//                   className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selectedSalesman === salesman.id.toString()
//                       ? 'border-blue-500 bg-blue-50 shadow-md'
//                       : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
//                     }`}
//                   onClick={() => setSelectedSalesman(salesman.id.toString())}
//                 >
//                   <div className="flex items-center space-x-4">
//                     <img
//                       src={salesman.profilePhoto}
//                       alt={salesman.name}
//                       className="w-16 h-16 rounded-full object-cover"
//                     />
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-gray-900">{salesman.name}</h3>
//                       <p className="text-sm text-gray-600">{salesman.email}</p>
//                     </div>
//                     <div className={`w-5 h-5 rounded-full border-2 ${selectedSalesman === salesman.id.toString()
//                         ? 'bg-blue-500 border-blue-500'
//                         : 'border-gray-300'
//                       }`}>
//                       {selectedSalesman === salesman.id.toString() && (
//                         <div className="w-full h-full rounded-full bg-white scale-50"></div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <button
//               onClick={handleStartAudit}
//               disabled={!selectedSalesman}
//               className={`w-full py-3 px-6 rounded-2xl font-medium transition-all duration-200 ${selectedSalesman
//                   ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
//                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 }`}
//             >
//               <PlayIcon className="w-5 h-5 inline mr-2" />
//               Start Audit
//             </button>
//           </div>
//         )}

//         {/* Step 3: Audit Process */}
//         {currentStep === 'audit' && selectedAudit && (
//           <div className="space-y-6">
//             <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center">
//                   <button
//                     onClick={() => setCurrentStep('salesman')}
//                     className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
//                   >
//                     <ArrowLeftIcon className="w-5 h-5" />
//                   </button>
//                   <h2 className="text-xl font-semibold text-gray-800">
//                     Audit Progress - {selectedAudit.counterName}
//                   </h2>
//                 </div>
//                 <div className="flex space-x-4 text-sm">
//                   <span className="text-green-600 font-medium">Matched: {matchedItems.length}</span>
//                   <span className="text-red-600 font-medium">Unmatched: {unmatchedItems.length}</span>
//                 </div>
//               </div>

//               {/* CPC Input */}
//               <div className="mb-6">
//                 <form onSubmit={handleCpcSubmit} className="flex space-x-4">
//                   <div className="flex-1 relative">
//                     <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       value={cpcInput}
//                       onChange={(e) => setCpcInput(e.target.value)}
//                       placeholder="Enter CPC number..."
//                       disabled={auditCompleted}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     disabled={auditCompleted || !cpcInput.trim()}
//                     className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Scan
//                   </button>
//                 </form>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex space-x-4 mb-6">
//                 <button
//                   onClick={handleCompleteAudit}
//                   disabled={auditCompleted}
//                   className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
//                 >
//                   <StopIcon className="w-5 h-5 mr-2" />
//                   Complete Audit
//                 </button>

//                 <button
//                   onClick={handleCancelAudit}
//                   disabled={auditCompleted}
//                   className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:from-red-600 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
//                 >
//                   <XMarkIcon className="w-5 h-5 mr-2" />
//                   Cancel Audit
//                 </button>

//                 {auditCompleted && (
//                   <button
//                     onClick={handleDownloadReport}
//                     className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
//                   >
//                     <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
//                     Download Report
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Matched and Unmatched Columns */}
//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
//                 <h3 className="text-lg font-semibold text-green-600 mb-4">Matched Items ({matchedItems.length})</h3>
//                 <div className="space-y-3 max-h-64 overflow-y-auto">
//                   {matchedItems.map((item, index) => (
//                     <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-xl">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-medium text-gray-900">{item.cpc}</p>
//                           <p className="text-sm text-gray-600">{item.name}</p>
//                         </div>
//                         <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
//                           {item.category}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
//                 <h3 className="text-lg font-semibold text-red-600 mb-4">Unmatched Items ({unmatchedItems.length})</h3>
//                 <div className="space-y-3 max-h-64 overflow-y-auto">
//                   {unmatchedItems.map((item, index) => (
//                     <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-xl">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-medium text-gray-900">{item.cpc}</p>
//                           <p className="text-sm text-gray-600">{item.name}</p>
//                         </div>
//                         <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
//                           {item.category}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }













import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ClipboardDocumentCheckIcon,
  UserIcon,
  PlayIcon,
  StopIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { GrPowerReset } from "react-icons/gr";
import { toast } from 'react-hot-toast';
import { fetchSalesman } from '../../slices/salesman.slice.js';

import {
  getAllAuditlogs,
  getAuditlogById
} from '../../services/auditlog.service.js';

import {
  setSalesman,
  scanItem,
  createReport,
  resetAuditLog,
  removeItem
} from '../../services/audit.service.js';
import { getTodayIST } from '../../utils/time.js';

export default function MyAudits() {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
  const allSalesmen = useSelector(state => state.salesman.allSalesman);

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentStep, setCurrentStep] = useState('auditList');
  const [selectedAudit, setSelectedAudit] = useState(null);

  const [selectedSalesman, setSelectedSalesman] = useState('');

  const [cpcInput, setCpcInput] = useState('');

  const [auditCompleted, setAuditCompleted] = useState(false);

  const [matchedItems, setMatchedItems] = useState({});
  const [unmatchedItems, setUnmatchedItems] = useState({});

  const [stepLoading, setStepLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cancel, setCancelling] = useState(false);

  // 1. Load today's audits
  const fetchTodaysAudit = async () => {
    setLoading(true);
    setError('');
    try {
      const { auditLogs } = await getAllAuditlogs({
        auditor: currentUser?._id,
        auditDate: getTodayIST()
      });

      setAuditLogs(auditLogs);

    } catch {
      setError('Failed to fetch audits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (currentAuditId) => {
    try {
      const auditLog = await getAuditlogById(currentAuditId);

      setMatchedItems(auditLog.auditFile.matchedItems);
      setUnmatchedItems(auditLog.auditFile.unmatchedItems);

    } catch (error) {
      console.log('Error from fetching items', error);
    }

  }


  // Only fetch salesmen on mount
  useEffect(() => {
    dispatch(fetchSalesman());
  }, [dispatch]);  // empty otherwise


  //Fetch today's audits once (and again if auditCompleted toggles)
  useEffect(() => {
    fetchTodaysAudit();
  }, [auditCompleted]);


  // When you select an audit, fetch its items
  useEffect(() => {
    if (selectedAudit) {
      fetchItems(selectedAudit._id);
    }
  }, [selectedAudit]);




  // 2. Select an audit to work on

  const handleSelectAudit = async audit => {
    setSelectedAudit(audit);
    setCurrentStep('salesman');

    setSelectedSalesman('');
    setCpcInput('');

    setAuditCompleted(false);
    await fetchItems(audit._id);

  };


  //  Assign salesman & begin audit
  const handleStartAudit = async () => {
    if (!selectedSalesman) return;
    setStepLoading(true);
    try {
      await setSalesman({ auditLogId: selectedAudit._id, salesmanId: selectedSalesman });
      setCurrentStep('audit');
    } catch {
      // errors are toasts in service
    } finally {
      setStepLoading(false);
    }
  };


  // 4. Scan individual CPC numbers
  const handleCpcSubmit = async e => {
    e.preventDefault();
    if (!cpcInput.trim() || auditCompleted) return;
    setScanning(true);
    try {
      const { item, alreadyMatched } = await scanItem({
        auditLogId: selectedAudit._id,
        cpcnumber: cpcInput.trim(),
      });

      await fetchItems(selectedAudit._id);

    } catch (err) {
      // scanItem will already have shown an error toast
    } finally {
      setCpcInput('');
      setScanning(false);
    }
  };


  // Complete audit & generate report
  const handleCompleteAudit = async () => {
    setStepLoading(true);
    try {
      await createReport(selectedAudit._id);
      setAuditCompleted(true);
      toast.success('Report generated successfully.');
    } catch {
      // createReport toasts its own errors
    } finally {
      setStepLoading(false);
    }
  };

  //  Download the generated PDF
  const handleDownloadReport = () => {
    getAuditlogById(selectedAudit._id)
      .then(({ reportFile }) => {
        if (reportFile?.downloadUrl) {
          window.open(reportFile.downloadUrl, '_blank');
        } else {
          toast.error('Report file not available.');
        }
      })
      .catch(() => toast.error('Could not fetch report file.'));
  };

  // Cancel or go back
  const handleCancelAudit = async () => {
    setCancelling(true);

    await resetAuditLog({ auditLogId: selectedAudit._id });

    setCurrentStep('salesman');

    await fetchItems(selectedAudit._id);

    setAuditCompleted(false);
    setCancelling(false);
  }

  const handleBackToList = async () => {
    setCurrentStep('auditList');

    setSelectedAudit(null);
    setMatchedItems({});
    setUnmatchedItems({});
  };

  const handleBackToSalesman = async () => {
    setCurrentStep('salesman');
  }

  const handleUnscan = async (cpcnumber) => {
    await removeItem({ auditLogId: selectedAudit._id, cpcnumber });
    await fetchItems(selectedAudit._id);
  }




  // Status counts for the dashboard
  const statusCounts = ['pending', 'audited', 'approved', 'disapproved'].map(status => ({
    label: status.charAt(0).toUpperCase() + status.slice(1),
    count: auditLogs.filter(l => l.auditStatus === status).length
  }));

  const getStatusColor = status => {
    switch (status) {
      case 'approved': return 'bg-green-50 border-green-200 text-green-800';
      case 'audited': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'pending': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'disapproved': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'audited': return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'pending': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'disapproved': return <XMarkIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading audits…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchTodaysAudit}
            className="bg-blue-500 text-white px-6 py-2 rounded-2xl hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl mb-4">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-purple-900">
            My Audits
          </h1>
          <p className="mt-2 text-gray-600">Manage your assigned inventory audits</p>
        </header>

        {/* --- Step 1: Dashboard & Audit List --- */}
        {currentStep === 'auditList' && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {statusCounts.map(({ label, count }) => {
                const Icon = {
                  Pending: ExclamationTriangleIcon,
                  Audited: ClockIcon,
                  Approved: CheckCircleIcon,
                  Disapproved: XMarkIcon
                }[label];
                return (
                  <div key={label} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{label}</p>
                        <p className="text-3xl font-bold">{count}</p>
                      </div>
                      <Icon className={`w-10 h-10 ${label === 'Pending' ? 'text-yellow-600' :
                        label === 'Audited' ? 'text-blue-600' :
                          label === 'Approved' ? 'text-green-600' :
                            'text-red-600'
                        }`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6">Today's Audit Logs</h2>
              <div className="space-y-4">
                {auditLogs.length === 0 && (
                  <div className="text-center py-12">
                    <ClipboardDocumentCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No audit logs assigned today</p>
                  </div>
                )}
                {auditLogs.map(log => (
                  <div
                    key={log._id}
                    onClick={() => handleSelectAudit(log)}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-shadow ${getStatusColor(log.auditStatus)
                      } hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(log.auditStatus)}
                          <h3 className="text-lg font-semibold">{log.counter.name}</h3>
                          <span className="px-3 py-1 text-xs bg-gray-200 rounded-full">
                            {log.counter.counterNumber}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p><strong>Location:</strong> {log.counter.location}</p>

                          </div>
                          <div>
                            <p><strong>Status:</strong> <span className="capitalize">{log.auditStatus}</span></p>
                          </div>
                          <div>
                            <p><strong>Remark:</strong> {log.remark}</p>
                          </div>
                          <div>
                            <p><strong>Date:</strong> {getTodayIST()}</p>
                          </div>
                        </div>
                      </div>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600">

                        {log.auditStatus === 'pending' ? 'Start' : 'Edit'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* --- Step 2: Salesman Selection --- */}
        {currentStep === 'salesman' && selectedAudit && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <button onClick={handleBackToList} className="mr-4 text-gray-600 hover:text-gray-800">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-semibold flex items-center">
                <UserIcon className="w-6 h-6 text-blue-600 mr-2" />
                Select Salesman for {selectedAudit.counter.name}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {allSalesmen.map(s => (
                <div
                  key={s._id}
                  onClick={() => setSelectedSalesman(s._id)}
                  className={`p-6 border-2 rounded-2xl cursor-pointer transition ${selectedSalesman === s._id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-6">
                    <img
                      src={s.avatar?.downloadUrl}
                      alt={s.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{s.fullName}</h3>
                      <p className="text-sm text-gray-600">{s.email}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${selectedSalesman === s._id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}>
                      {selectedSalesman === s._id && <div className="w-full h-full bg-white rounded-full scale-50" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleStartAudit}
              disabled={!selectedSalesman || stepLoading}
              className={`w-full py-3 rounded-2xl font-medium transition ${selectedSalesman
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <PlayIcon className="w-5 h-5 inline mr-2" />
              {stepLoading ? 'Assigning…' : 'Start Audit'}
            </button>
          </div>
        )}

        {/* --- Step 3: CPC Scanning & Complete --- */}
        {currentStep === 'audit' && selectedAudit && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">

                  <button onClick={handleBackToSalesman}
                    className="mr-4 text-gray-600 hover:text-gray-800">
                    <ArrowLeftIcon className="w-5 h-5" />

                  </button>

                  <h2 className="text-xl font-semibold">Auditing {selectedAudit.counter.name}</h2>
                </div>
                <div className="flex space-x-4 text-sm">
                  <span className="text-green-600">Matched: {Object.keys(matchedItems).length}</span>
                  <span className="text-red-600">Unmatched: {Object.keys(unmatchedItems).length}</span>
                </div>
              </div>

              <form onSubmit={handleCpcSubmit} className="flex space-x-4 mb-6">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={cpcInput}
                    autoFocus
                    onChange={e => setCpcInput(e.target.value)}
                    placeholder="Enter CPC number…"
                    disabled={auditCompleted}
                    className="w-full pl-10 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!cpcInput.trim() || auditCompleted || scanning}
                  className="px-8 py-3 bg-blue-500 text-white text-xl font-bold rounded-2xl hover:bg-blue-600 disabled:bg-gray-300"
                >
                  {scanning ? 'Scanning..' : 'Scan'}
                </button>
              </form>

              <div className="flex space-x-4">
                <button
                  onClick={handleCompleteAudit}
                  disabled={auditCompleted || stepLoading}
                  className={`flex-1 flex justify-center ${stepLoading && 'cursor-not-allowed'} items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 disabled:bg-gray-300`}
                >
                  <StopIcon className="w-5 h-5 mr-2" />
                  {stepLoading ? 'Completing…' : 'Complete Audit'}
                </button>
                <button
                  onClick={handleCancelAudit}
                  disabled={stepLoading || cancel}
                  className={`flex-1 flex justify-center ${cancel && 'cursor-not-allowed'} items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-2xl hover:from-red-600 disabled:bg-gray-300`}
                >
                  <GrPowerReset />
                  {cancel ? 'Resetting..' : 'Reset'}
                </button>
                {auditCompleted && (
                  <button
                    onClick={handleDownloadReport}
                    className="flex-1 flex justify-center items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Download Report
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Matched */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-green-600 mb-4">
                  Matched Items ({Object.keys(matchedItems).length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(matchedItems).map(([cpc, it]) => (
                    <div key={cpc} className="flex justify-between bg-green-100 border-2 border-green-300 rounded-xl p-3">
                      <div>
                        <p className="font-medium">{it.cpcnumber}</p>
                        <p className="text-sm font-bold text-gray-600">{it.group}</p>
                      </div>
                      <button onClick={() => handleUnscan(it.cpcnumber)} className="px-3 text-sm font-bold bg-green-300 text-gray-800 rounded-2xl hover:cursor-pointer">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Unmatched */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-red-600 mb-4">
                  Unmatched Items ({Object.keys(unmatchedItems).length})
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(unmatchedItems).map(([cpc, it]) => (
                    <div key={cpc} className="flex justify-between bg-red-100 border-2 border-red-300 rounded-xl p-3">
                      <div>
                        <p className="font-medium">{it.cpcnumber}</p>
                        <p className="text-sm font-bold text-gray-600">unknown</p>
                      </div>

                      <button onClick={() => handleUnscan(it.cpcnumber)} className="px-3 text-sm font-bold bg-red-300 text-gray-800 rounded-2xl hover:cursor-pointer">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
