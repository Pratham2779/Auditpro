import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

import {
  MdSpaceDashboard,
  MdOutlineSettings,
  MdLogout,
  MdOutlineManageAccounts
} from "react-icons/md";
import { RiHistoryLine } from "react-icons/ri";
import { IoNotificationsOutline } from "react-icons/io5";
import { AiOutlineAudit } from "react-icons/ai";

const AdminLayout = () => {
  const user = useSelector((state) => state.auth.user);

 
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <MdSpaceDashboard className='h-6 w-6' /> },
    { name: 'Assign Audits', path: '/admin/assign-audits', icon: <AiOutlineAudit className='h-6 w-6' /> },
    { name: 'Audit History', path: '/admin/audit-history', icon: <RiHistoryLine className='h-6 w-6' /> },
    { name: 'Manage Personnel', path: '/admin/manage-personnel', icon: <MdOutlineManageAccounts className='h-6 w-6' /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <IoNotificationsOutline className='h-6 w-6' /> },
    { name: 'Settings', path: '/admin/settings', icon: <MdOutlineSettings className='h-6 w-6' /> },
    { name: 'Logout', path: '/', icon: <MdLogout className='h-6 w-6' /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <Sidebar
        menuItems={menuItems}
        role={user?.role || 'Admin'}
        mobileSidebarOpen={mobileSidebarOpen}
        onMobileSidebarClose={handleMobileSidebarClose}
      />

      {/* Main content */}
      <div className="flex flex-col flex-grow md:ml-0 ml-0 w-full">
        <Navbar onMobileSidebarToggle={handleMobileSidebarToggle} />

        {/* Routed Content */}
        <main className="flex-grow overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;












