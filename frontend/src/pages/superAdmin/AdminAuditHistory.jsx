import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, User, MapPin, Filter, Download, Eye, FileText, Clock, CheckCircle, AlertCircle, Flag, File, Trash2 } from 'lucide-react';
import { getAllAuditlogs ,deleteAuditlog} from '../../services/auditlog.service.js';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  approved: {
    border: 'border-emerald-200',
    bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
    text: 'text-emerald-700',
    icon: CheckCircle,
    badgeColor: 'bg-emerald-100 text-emerald-800',
    display: 'Completed'
  },
  pending: {
    border: 'border-amber-200',
    bg: 'bg-gradient-to-r from-amber-50 to-amber-100',
    text: 'text-amber-700',
    icon: Clock,
    badgeColor: 'bg-amber-100 text-amber-800',
    display: 'Pending'
  },
  disapproved: {
    border: 'border-red-200',
    bg: 'bg-gradient-to-r from-red-50 to-red-100',
    text: 'text-red-700',
    icon: Flag,
    badgeColor: 'bg-red-100 text-red-800',
    display: 'Flagged'
  },
  audited: {
    border: 'border-blue-200',
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
    text: 'text-blue-700',
    icon: CheckCircle,
    badgeColor: 'bg-blue-100 text-blue-800',
    display: 'Audited'
  }
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pagesToShow = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
  } else {
    pagesToShow.push(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) {
      pagesToShow.push('left-ellipsis');
    }
    for (let i = left; i <= right; i++) {
      pagesToShow.push(i);
    }
    if (right < totalPages - 1) {
      pagesToShow.push('right-ellipsis');
    }
    pagesToShow.push(totalPages);
  }

  const handleClick = (p) => {
    if (typeof p === 'number' && p !== currentPage) {
      onPageChange(p);
    }
  };


  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed border-gray-200'
            : 'text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
        }`}
      >
        Previous
      </button>
      
      {pagesToShow.map((p, idx) => {
        if (p === 'left-ellipsis' || p === 'right-ellipsis') {
          return (
            <span key={idx} className="px-3 py-2 text-gray-400">
              ...
            </span>
          );
        }
        return (
          <button
            key={idx}
            onClick={() => handleClick(p)}
            className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
              p === currentPage
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                : 'text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
            }`}
          >
            {p}
          </button>
        );
      })}
      
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed border-gray-200'
            : 'text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
        }`}
      >
        Next
      </button>
    </div>
  );
}

export default function AuditHistory() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalAudits, setTotalAudits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('All');
  const [filterAuditor, setFilterAuditor] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const pageSize = 8;
  const navigate=useNavigate();


 const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const queryParams = {
          page: currentPage,
          limit: pageSize,
          ...(searchTerm && { search: searchTerm }),
          ...(filterDate !== 'All' && { auditDate: filterDate }),
          ...(filterStatus !== 'All' && { 
            auditStatus: filterStatus.toLowerCase() 
          })
        };
        
        const response = await getAllAuditlogs(queryParams);
        setAuditLogs(response.auditLogs);
        setTotalAudits(response.total);
      } catch (err) {
        setError('Failed to fetch audit logs. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };



  useEffect(() => {
    fetchAuditLogs();
    
  }, [currentPage, searchTerm, filterDate, filterStatus]);


console.log('dd',auditLogs);

  // Extract unique values for filters
  const allDates = useMemo(() => {
    const dates = new Set();
    auditLogs.forEach(log => {
      if (log.auditDate) {
        const dateStr = new Date(log.auditDate).toISOString().split('T')[0];
        dates.add(dateStr);
      }
    });
    return Array.from(dates).sort().reverse();
  }, [auditLogs]);

  const allAuditors = useMemo(() => {
    const auditors = new Set();
    auditLogs.forEach(log => {
      if (log.auditor && log.auditor.fullName) {
        auditors.add(log.auditor.fullName);
      }
    });
    return Array.from(auditors).sort();
  }, [auditLogs]);

  const allLocations = useMemo(() => {
    const locations = new Set();
    auditLogs.forEach(log => {
      if (log.counter && log.counter.location) {
        locations.add(log.counter.location);
      }
    });
    return Array.from(locations).sort();
  }, [auditLogs]);

  const allStatuses = useMemo(() => {
    const statuses = new Set();
    auditLogs.forEach(log => {
      if (log.auditStatus) {
        statuses.add(statusConfig[log.auditStatus]?.display || log.auditStatus);
      }
    });
    return Array.from(statuses).sort();
  }, [auditLogs]);

  // Statistics
  const completedCount = useMemo(() => 
    auditLogs.filter(log => log.auditStatus === 'approved').length, 
    [auditLogs]
  );
  
  const pendingCount = useMemo(() => 
    auditLogs.filter(log => log.auditStatus === 'pending').length, 
    [auditLogs]
  );
  
  const flaggedCount = useMemo(() => 
    auditLogs.filter(log => log.auditStatus === 'disapproved').length, 
    [auditLogs]
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleViewLog = (log) => {
   
    setViewingLog(log);
   
    navigate(`/admin/adminAuditOverview`,{state:{auditLog:log}});
  };


const handleDeleteLog=async (log)=>{
  await deleteAuditlog(log?._id);
  await fetchAuditLogs();
}


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-base">Loading audit history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-6 text-base">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Audit History
              </h1>
              <p className="text-gray-600 text-base">
                Comprehensive overview of all audit activities and their current status
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white rounded-xl px-6 py-3 shadow-sm border border-gray-200">
                <div className="text-base text-gray-500">Total Audits</div>
                <div className="text-2xl font-bold text-gray-900">{totalAudits}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-emerald-600">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-600">Disapproved</p>
                <p className="text-3xl font-bold text-red-600">{flaggedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by Audit ID, Auditor, or Location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterDate}
                  onChange={handleFilterChange(setFilterDate)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-10 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  <option value="All">All Dates</option>
                  {allDates.map((d) => (
                    <option key={d} value={d}>
                      {formatDate(d)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterAuditor}
                  onChange={handleFilterChange(setFilterAuditor)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-10 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  <option value="All">All Auditors</option>
                  {allAuditors.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterLocation}
                  onChange={handleFilterChange(setFilterLocation)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-10 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  <option value="All">All Locations</option>
                  {allLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={handleFilterChange(setFilterStatus)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-10 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  <option value="All">All Statuses</option>
                  {allStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No audits found</h3>
              <p className="text-gray-500 text-base">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            auditLogs.map((log) => {
              const statusInfo = statusConfig[log.auditStatus] || {};
              const StatusIcon = statusInfo.icon || FileText;
              const displayStatus = statusInfo.display || log.auditStatus;
              const isExpanded = expandedId === log._id;

              return (
                <div
                  key={log._id}
                  className={`bg-white rounded-xl shadow-sm border-l-4 ${statusInfo.border || 'border-gray-200'} hover:shadow-md transition-all duration-200 overflow-hidden group`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">{log._id}</h3>
                          <p className="text-gray-500 text-sm">
                            {log.auditDate ? formatDate(log.auditDate) : 'No date'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.badgeColor || 'bg-gray-100 text-gray-800'}`}>
                          {StatusIcon && <StatusIcon className="w-4 h-4 mr-1" />}
                          {displayStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Auditor:</span>
                        <div className="flex items-center space-x-2">
                          {log.auditor?.avatar?.url ? (
                            <img 
                              src={log.auditor.avatar.url} 
                              alt={log.auditor.fullName} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 truncate text-base">
                            {log.auditor?.fullName || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-900 truncate text-base">
                          {log.counter?.location || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-600">Counter:</span>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-base">
                            {log.counter?.name || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-gray-700 text-base">{log.remark || 'No remarks available'}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <a
                          href={log.auditFile?.url || '#'}
                          className="text-blue-600 hover:text-blue-800 font-medium text-base"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {log.auditFile?.original_filename || 'audit_file.csv'}
                        </a>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log._id)}
                          className="inline-flex items-center px-3 py-1.5 font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors text-base"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          {isExpanded ? 'Hide' : 'Remark'}
                        </button>
                        
                        {/* View Button */}
                        <button 
                          onClick={() => handleViewLog(log)}
                          className="inline-flex items-center px-3 py-1.5 font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-base"
                        >
                          <File className="w-4 h-4 mr-1.5" />
                          View
                        </button>



                            <button 
                          onClick={() => handleDeleteLog(log)}
                          className="inline-flex items-center px-3 py-1.5 font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors text-base"
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Delete
                        </button>
                        





                        <a
                          href={log.auditFile?.downloadUrl || '#'}
                          className="inline-flex items-center px-3 py-1.5 font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors text-base"
                          download
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          CSV
                        </a>


                        <a
                          href={log.reportFile?.downloadUrl || '#'}
                          className="inline-flex items-center px-3 py-1.5 font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors text-base"
                          download
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          Report
                        </a>


                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalAudits > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalAudits / pageSize)}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}