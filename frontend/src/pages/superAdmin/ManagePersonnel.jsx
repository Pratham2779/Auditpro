import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAuditors, addAuditor, editAuditor, removeAuditor
} from '../../slices/auditor.slice.js';
import {
  fetchSalesman, addSalesman, editSalesman, removeSalesman
} from '../../slices/salesman.slice.js';
import {
  fetchCounter, addCounter, editCounter, removeCounter
} from '../../slices/counter.silce.js';
import { toast } from 'react-hot-toast';

const ManagePersonnel = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [operation, setOperation] = useState('create');
  const [submitting, setSubmitting] = useState(false);

  const [auditorForm, setAuditorForm] = useState({
    fullName: '', email: '', password: '', phoneNumber: '', gender: 'Male', avatar: null
  });

  const [salesmanForm, setSalesmanForm] = useState({
    fullName: '', email: '', counter: '', phoneNumber: '', gender: 'Male', avatar: null
  });

  const [counterForm, setCounterForm] = useState({
    name: '', counterNumber: '', location: ''
  });

  const { allAuditors, loadingAuditor } = useSelector(state => state.auditor);
  const { allSalesman, loadingSalesman } = useSelector(state => state.salesman);
  const { allCounter, loadingCounter } = useSelector(state => state.counter);

  const tabs = ['Auditors', 'Salesmen', 'Counters'];
  const isLoading = [loadingAuditor, loadingSalesman, loadingCounter][activeTab];

  useEffect(() => {
    dispatch(fetchAuditors());
    dispatch(fetchSalesman());
    dispatch(fetchCounter());
  }, [dispatch]);

  const resetForms = () => {
    setAuditorForm({ fullName: '', email: '', password: '', phoneNumber: '', gender: 'Male', avatar: null });
    setSalesmanForm({ fullName: '', email: '', counter: '', phoneNumber: '', gender: 'Male', avatar: null });
    setCounterForm({ name: '', counterNumber: '', location: '' });
  };

  const openModal = (op, item = null) => {
    setOperation(op);
    setCurrentItem(item);

    if (op === 'edit' && item) {
      if (activeTab === 0) {
        setAuditorForm({
          fullName: item.fullName, email: item.email, password: '', phoneNumber: item.phoneNumber,
          gender: item.gender.charAt(0).toUpperCase() + item.gender.slice(1).toLowerCase(), avatar: null
        });
      } else if (activeTab === 1) {
        setSalesmanForm({
          fullName: item.fullName, email: item.email, counter: item.counter?._id || item.counter || '',
          phoneNumber: item.phoneNumber, gender: item.gender.charAt(0).toUpperCase() + item.gender.slice(1).toLowerCase(), avatar: null
        });
      } else {
        setCounterForm({ name: item.name, counterNumber: item.counterNumber, location: item.location || '' });
      }
    } else {
      resetForms();
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitting(false);
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    const setters = { auditor: setAuditorForm, salesman: setSalesmanForm, counter: setCounterForm };
    setters[formType]?.(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (activeTab === 0) setAuditorForm(prev => ({ ...prev, avatar: file }));
    else if (activeTab === 1) setSalesmanForm(prev => ({ ...prev, avatar: file }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const forms = [auditorForm, salesmanForm, counterForm];
    const actions = [
      { add: addAuditor, edit: editAuditor },
      { add: addSalesman, edit: editSalesman },
      { add: addCounter, edit: editCounter }
    ];

    const formData = activeTab < 2 ? new FormData() : forms[activeTab];

    if (activeTab < 2) {
      Object.entries(forms[activeTab]).forEach(([key, value]) => {
        if (key === 'password' && operation === 'edit' && !value) return;
        if (key === 'avatar' && !value) return;
        if (value !== null && value !== undefined) formData.append(key, value);
      });
      if (activeTab === 0) formData.append('role', 'auditor');
    }

    const action = operation === 'create' ? actions[activeTab].add : actions[activeTab].edit;
    const payload = operation === 'create' ? formData : { id: currentItem._id, formData };

    dispatch(action(payload))
      .unwrap()
      .then(() => {
        toast.success(`${tabs[activeTab].slice(0, -1)} ${operation}d successfully`);
        closeModal();
      })
      .catch(error => toast.error(error.message))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const deleteActions = [removeAuditor, removeSalesman, removeCounter];
      dispatch(deleteActions[activeTab](id))
        .unwrap()
        .then(() => toast.success(`${tabs[activeTab].slice(0, -1)} deleted successfully`))
        .catch(error => toast.error(error.message));
    }
  };

  const tabButtons = () => (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-4 sm:p-6">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold text-sm sm:text-md transition-colors w-full sm:w-auto
            ${activeTab === index
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  // Mobile card view for better responsiveness
  const renderMobileCard = (item) => {
    return (
      <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start space-x-3">
          {activeTab < 2 && (
            <img
              src={item.avatar?.url || '/api/placeholder/40/40'}
              alt={item.fullName}
              className="h-12 w-12 rounded-full object-cover border flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {activeTab < 2 ? item.fullName : item.name}
            </h3>
            {activeTab < 2 && (
              <p className="text-sm text-gray-600 truncate">{item.email}</p>
            )}
            {activeTab === 1 && item.counter && (
              <p className="text-sm text-gray-600">
                Counter: {item.counter?.name} (#{item.counter?.counterNumber})
              </p>
            )}
            {activeTab === 2 && (
              <p className="text-sm text-gray-600">#{item.counterNumber}</p>
            )}
            {activeTab < 2 && (
              <p className="text-sm text-gray-600">{item.phoneNumber}</p>
            )}
            {activeTab === 0 && (
              <p className="text-sm text-gray-600">{item.gender}</p>
            )}
            {activeTab === 2 && item.location && (
              <p className="text-sm text-gray-600">{item.location}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <button
              onClick={() => openModal('edit', item)}
              className="text-blue-700 bg-blue-200 px-3 py-1 rounded-lg text-sm hover:bg-blue-300 transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(item._id)}
              className="text-red-700 bg-red-200 px-3 py-1 rounded-lg text-sm hover:bg-red-300 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    const data = [allAuditors, allSalesman, allCounter][activeTab];
    const headers = [
      ['Avatar', 'Name', 'Email', 'Phone', 'Gender', 'Actions'],
      ['Avatar', 'Name', 'Email', 'Counter', 'Phone', 'Actions'],
      ['Name', 'Number', 'Location', 'Actions']
    ];

    // Mobile view
    if (window.innerWidth < 768) {
      return (
        <div className="space-y-4">
          {data.map((item) => renderMobileCard(item))}
        </div>
      );
    }

    // Desktop table view
    return (
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm lg:text-base">
          <thead className="bg-gray-200">
            <tr>
              {headers[activeTab].map((header, index) => (
                <th
                  key={index}
                  className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-600 uppercase tracking-wider text-xs sm:text-sm"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                {activeTab < 2 && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <img
                      src={item.avatar?.url || '/api/placeholder/40/40'}
                      alt={item.fullName}
                      className="h-10 w-10 sm:h-14 sm:w-14 rounded-full object-cover border"
                    />
                  </td>
                )}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                  <div className="max-w-[150px] sm:max-w-none truncate">
                    {activeTab < 2 ? item.fullName : item.name}
                  </div>
                </td>
                {activeTab < 2 && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-800">
                    <div className="max-w-[120px] sm:max-w-none truncate">
                      {item.email}
                    </div>
                  </td>
                )}
                {activeTab === 1 && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-800">
                    <div className="max-w-[150px] sm:max-w-none truncate">
                      {item.counter?.name} (#{item.counter?.counterNumber})
                    </div>
                  </td>
                )}
                {activeTab === 2 && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-800">
                    {item.counterNumber}
                  </td>
                )}
                {activeTab < 2 && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-800">
                    <div className="max-w-[100px] sm:max-w-none truncate">
                      {item.phoneNumber}
                    </div>
                  </td>
                )}
                {activeTab === 0 && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-800">{item.gender}</td>
                )}
                {activeTab === 2 && (
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-800">
                    <div className="max-w-[120px] sm:max-w-none truncate">
                      {item.location || '-'}
                    </div>
                  </td>
                )}
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => openModal('edit', item)}
                      className="text-blue-700 bg-blue-200 px-2 sm:px-3 py-1 sm:py-2 rounded-xl hover:bg-blue-300 transition text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-700 bg-red-200 px-2 sm:px-3 py-1 sm:py-2 rounded-xl hover:bg-red-300 transition text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderForm = () => {
    const commonInputClass =
      "w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base";

    if (activeTab === 0) {
      // Auditor form
      return (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Fullname</label>
            <input
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={auditorForm.fullName}
              onChange={(e) => handleInputChange(e, 'auditor')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={auditorForm.email}
              onChange={(e) => handleInputChange(e, 'auditor')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>
              {operation == 'create' ? 'Password' : 'New Password'}
            </label>
            <input
              name="password"
              type="password"
              placeholder={operation == 'create' ? 'Password' : 'New Password'}
              value={auditorForm.password}
              onChange={(e) => handleInputChange(e, 'auditor')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Phone Number</label>
            <input
              name="phoneNumber"
              type="text"
              placeholder="Phone Number"
              value={auditorForm.phoneNumber}
              onChange={(e) => handleInputChange(e, 'auditor')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Gender</label>
            <select
              name="gender"
              value={auditorForm.gender}
              onChange={(e) => handleInputChange(e, 'auditor')}
              className={commonInputClass}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={commonInputClass}
            />
          </div>
        </div>
      );
    }

    if (activeTab === 1) {
      // Salesman form
      return (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Fullname</label>
            <input
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={salesmanForm.fullName}
              onChange={(e) => handleInputChange(e, 'salesman')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={salesmanForm.email}
              onChange={(e) => handleInputChange(e, 'salesman')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Phone Number</label>
            <input
              name="phoneNumber"
              type="text"
              placeholder="Phone Number"
              value={salesmanForm.phoneNumber}
              onChange={(e) => handleInputChange(e, 'salesman')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Gender</label>
            <select
              name="gender"
              value={salesmanForm.gender}
              onChange={(e) => handleInputChange(e, 'salesman')}
              className={commonInputClass}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Counter</label>
            <select
              name="counter"
              value={salesmanForm.counter}
              onChange={(e) => handleInputChange(e, 'salesman')}
              className={commonInputClass}
            >
              <option value="">Select Counter</option>
              {allCounter.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} (#{c.counterNumber})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={commonInputClass}
            />
          </div>
        </div>
      );
    }

    if (activeTab === 2) {
      // Counter form
      return (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Name</label>
            <input
              name="name"
              type="text"
              placeholder="Counter Name"
              value={counterForm.name}
              onChange={(e) => handleInputChange(e, 'counter')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Counter Number</label>
            <input
              name="counterNumber"
              type="text"
              placeholder="Counter Number"
              value={counterForm.counterNumber}
              onChange={(e) => handleInputChange(e, 'counter')}
              className={commonInputClass}
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1 pl-2'>Counter Location</label>
            <input
              name="location"
              type="text"
              placeholder="Location"
              value={counterForm.location}
              onChange={(e) => handleInputChange(e, 'counter')}
              className={commonInputClass}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading manage personnels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className="py-6 sm:py-8 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Personnels</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage persons efficiently</p>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {tabButtons()}
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{tabs[activeTab]}</h1>
              <button
                onClick={() => openModal('create')}
                className="bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl hover:bg-blue-700 transition font-bold text-sm sm:text-base w-full sm:w-auto"
              >
                Add New
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] sm:max-h-[530px]">
              {renderTable()}
            </div>
          </div> 
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-10 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {operation === 'create'
                    ? `Add New ${tabs[activeTab].slice(0, -1)}`
                    : `Edit ${tabs[activeTab].slice(0, -1)}`}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl sm:text-4xl leading-none font-bold"
                >
                  ×
                </button>
              </div>

              {renderForm()}

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 font-bold">
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition order-1 sm:order-2"
                >
                  {submitting ? 'Processing...' : operation === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePersonnel;
