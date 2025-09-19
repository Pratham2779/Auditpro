import React, { useState, useEffect } from 'react';
import { Bell, Send, Inbox, MessageCircle, User, ChevronLeft, ChevronRight, Search, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditors } from '../../slices/auditor.slice.js';
import { 
  getAllNotifications, 
  sendNotification,
  deleteNotification
} from '../../services/notification.service.js';
import { formatDistanceToNow } from 'date-fns';

function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('compose');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  const [composeData, setComposeData] = useState({
    receiver: '',
    subject: '',
    content: ''
  });

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { allAuditors, loadingAuditor } = useSelector(state => state.auditor);

  useEffect(() => {
    // Fetch auditors when component mounts
    dispatch(fetchAuditors());
    fetchNotifications();
  }, [dispatch]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus === 'sent') params.send = 'true';
      if (filterStatus === 'received') params.received = 'true';
      if (searchTerm) params.search = searchTerm;
      
      const data = await getAllNotifications(params);
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications. Please try again later.');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterStatus, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComposeData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendNotification = async () => {
    if (!composeData.receiver || !composeData.content) return;
    
    try {
      await sendNotification({
        receiver: composeData.receiver,
        subject: composeData.subject,
        content: composeData.content
      });
      
      // Refresh notifications
      fetchNotifications();
      
      // Reset form
      setComposeData({ receiver: '', subject: '', content: '' });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Filter and search notifications
  const filteredNotifications = notifications
    .filter(notification => {
      const isSent = notification.sender._id === user._id;
      const matchesType = 
        filterStatus === 'all' ||
        (filterStatus === 'sent' && isSent) ||
        (filterStatus === 'received' && !isSent);
      
      const matchesSearch = 
        notification.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isSent 
          ? notification.receiver.fullName.toLowerCase().includes(searchTerm.toLowerCase())
          : notification.sender.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        notification.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  const tabs = [
    { id: 'compose', label: 'Compose', icon: MessageCircle },
    { id: 'all', label: 'All Messages', icon: Bell },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'received', label: 'Received', icon: Inbox }
  ];

  if (loadingAuditor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auditors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-white/60 rounded-xl backdrop-blur-sm shadow-lg">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800">Notification Center</h1>
              <p className="text-gray-600 mt-1">Manage communications with your audit team</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                  if (tab.id === 'sent') setFilterStatus('sent');
                  else if (tab.id === 'received') setFilterStatus('received');
                  else setFilterStatus('all');
                }}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Section */}
          {activeTab === 'compose' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Compose Message</span>
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Auditor Selection */}
                  <div className="space-y-2 relative">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 text-blue-500" />
                      <span>Select Auditor</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        name="receiver"
                        value={composeData.receiver}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
                      >
                        <option value="">Choose an auditor</option>
                        {allAuditors.map(auditor => (
                          <option key={auditor._id} value={auditor._id}>
                            {auditor.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Subject (Optional)</label>
                    <input
                      type="text"
                      name="subject"
                      value={composeData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter message subject"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      name="content"
                      value={composeData.content}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white resize-none"
                      required
                    />
                  </div>

                  {/* Send Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSendNotification}
                      disabled={!composeData.receiver || !composeData.content}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className={activeTab === 'compose' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Messages</span>
                  </h2>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {filteredNotifications.length} Total
                  </span>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">All Messages</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                  </select>
                </div>
              </div>

              {/* Messages List */}
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading messages...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-500 text-lg">{error}</p>
                    <button 
                      onClick={fetchNotifications}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : paginatedNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No messages found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {paginatedNotifications.map((notification) => {
                      const isSent = notification.sender._id === user._id;
                      const auditor = isSent ? notification.receiver : notification.sender;
                      
                      return (
                        <div
                          key={notification._id}
                          className={`p-4 hover:bg-gray-50 transition-colors relative group ${
                            notification.status === 'unread' && !isSent 
                              ? 'bg-blue-50 border-l-4 border-blue-400' 
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                 <div className="w-10 h-10 rounded-full overflow-hidden">
                                {auditor.avatar ? (
                                  <img
                                    src={auditor?.avatar?.url}
                                    alt={auditor.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                    {auditor.fullName.split(' ').map(n => n[0]).join('')}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-800">{auditor.fullName}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isSent ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                  }`}>
                                    {isSent ? 'sent' : 'received'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{formatTimestamp(notification.createdAt)}</span>
                              <button
                                onClick={() => handleDeleteNotification(notification._id)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete message"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="ml-11">
                            {notification.subject && (
                              <h4 className="font-medium text-gray-800 mb-1">{notification.subject}</h4>
                            )}
                            <p className="text-sm text-gray-600 line-clamp-2">{notification.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
                <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} messages
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;









