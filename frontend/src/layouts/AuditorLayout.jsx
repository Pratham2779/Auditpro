import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

import { MdSpaceDashboard, MdOutlineSettings, MdLogout } from "react-icons/md";
import { RiHistoryLine } from "react-icons/ri";
import { IoNotificationsOutline } from "react-icons/io5";
import { AiOutlineAudit } from "react-icons/ai";

const AuditorLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(prev => !prev);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/auditor/dashboard', icon: <MdSpaceDashboard className='h-6 w-6' /> },
    { name: 'My Audits', path: '/auditor/my-audits', icon: <AiOutlineAudit className='h-6 w-6' /> },
    { name: 'Audit History', path: '/auditor/audit-history', icon: <RiHistoryLine className='h-6 w-6' /> },
    { name: 'Notifications', path: '/auditor/notifications', icon: <IoNotificationsOutline className='h-6 w-6' /> },
    { name: 'Settings', path: '/auditor/settings', icon: <MdOutlineSettings className='h-6 w-6' /> },
    { name: 'Logout', path: '/auditor/logout', icon: <MdLogout className='h-6 w-6' /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <Sidebar
        menuItems={menuItems}
        role="Auditor"
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

export default AuditorLayout;
