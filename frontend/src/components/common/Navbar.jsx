import React, { useState, useEffect, useRef } from 'react';
import {
  MdNotifications,
  MdMenu,
  MdExpandMore,
  MdPerson,
  MdSettings,
  MdLogout,
  MdWbSunny,
  MdNightlight,
  MdLanguage,
  MdTimeline,
  MdMessage
} from 'react-icons/md';
import logo from '../../assets/logo.png'

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../slices/auth.slice.js';
import { logoutUser } from '../../services/auth.service.js';

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WelcomeStatus({ currentTime, isMobile, isTablet }) {
  const currentUser = useSelector((state) => state.auth.user);
  
  const formatTime = date =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: isMobile });
  const formatDate = date =>
    isMobile
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative">
        {/* <div className={`rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg 
        ${isMobile ? 'p-2' : 'p-3'
          }`
          
          
          }>
          <MdTimeline className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'}`} />
        </div> */}
 <div
      className={`rounded-2xl text-white shadow-lg h-12 w-12
        ${isMobile ? 'p-2' : 'p-3'}`}
      style={{
        backgroundImage: `url(${logo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
    </div>


        
        <div className={`absolute -top-1 -right-1 bg-green-400 rounded-full animate-pulse border-2 border-white ${isMobile ? 'w-2 h-2' : 'w-3 h-3'
          }`}></div>
      </div>
      <div className="hidden sm:block">
        <h2
          className={`font-bold text-gray-800 flex items-center gap-2 ${isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-xl'
            }`}
        >
          {isMobile ? 'Welcome!' : `Welcome back, ${currentUser?.role}!`}
          <span className={`${isMobile ? 'text-sm' : 'text-base'}`}>👋</span>
        </h2>
        <div
          className={`flex items-center gap-2 sm:gap-4 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'
            }`}
        >
          <span className="flex items-center gap-1">
            <MdLanguage className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {formatDate(currentTime)}
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {formatTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActionBar({ isMobile, isDarkMode, toggleDarkMode, notificationCount }) {
   
 const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

   const handleNavigation = (path) => {
    navigate(path,{state:{quickAction:'all'}});
  };
  return (
    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative z-10">
      <button className={`relative rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 ${isMobile ? 'p-1.5' : 'p-2'}`}
        onClick={() => handleNavigation(`/${currentUser?.role}/notifications`)}
      >
        <MdMessage className={`text-gray-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span className={`absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full flex items-center justify-center animate-pulse ${isMobile ? 'px-1 py-0.5 min-w-[16px] h-[16px]' : 'px-1.5 py-0.5 min-w-[18px] h-[18px]'
          }`}>2</span>
      </button>

      <button className={`relative rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 ${isMobile ? 'p-1.5' : 'p-2'}`}
      onClick={() => {
        navigate(`/${currentUser?.role}/notifications`,{state:{quickAction:'compose'}});}}
      >
        <MdNotifications className={`text-gray-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        {notificationCount > 0 && (
          <span className={`absolute -top-1 -right-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center animate-bounce ${isMobile ? 'px-1 py-0.5 min-w-[16px] h-[16px]' : 'px-1.5 py-0.5 min-w-[18px] h-[18px]'
            }`}>{notificationCount}</span>
        )}
      </button>
    </div>
  );
}













function ProfileMenu({ isMobile, dropdownOpen, toggleDropdown, dropdownRef }) {
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignout = async () => {
    await logoutUser();
    dispatch(logout());
    setTimeout(() => navigate('/'), 100); // Ensures state update before navigation
  };

  // Close dropdown when navigating
  const handleNavigation = (path) => {
    toggleDropdown(); // Close the dropdown
    navigate(path);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`flex items-center bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:scale-105 ${isMobile ? 'p-1.5' : 'gap-3 px-3 py-2'}`}
      >
        <div
          className={`relative rounded-xl text-white flex items-center justify-center font-bold bg-gradient-to-br from-emerald-400 to-teal-500 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}
          style={{
            backgroundImage: `url(${currentUser?.avatar?.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!currentUser?.avatar?.url && (currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A')}
        </div>

        {!isMobile && (
          <>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-gray-800">{currentUser?.role} User</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>Online
              </p>
            </div>
            <MdExpandMore className={`text-gray-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} h-4 w-4`} />
          </>
        )}
      </button>

      {/* Dropdown Content */}
      <div className={`absolute right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 transition-all duration-300 origin-top-right overflow-hidden ${dropdownOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'} ${isMobile ? 'w-56' : 'w-64'}`}>
        
        {/* User Info Header */}
        <div className={`border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`relative rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}
              style={{
                backgroundImage: `url(${currentUser?.avatar?.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!currentUser?.avatar?.url && (currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A')}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
                {currentUser?.name || `${currentUser?.role} User`}
              </p>
              <p
                className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}
                title={currentUser?.email || 'admin@gmail.com'}
              >
                {currentUser?.email || 'admin@gmail.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={() => handleNavigation(`/${currentUser?.role}/settings`)}
            className={`w-full text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700 ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}
          >
            <MdSettings className="h-4 w-4" />
            <span className={`${isMobile ? 'text-sm' : 'text-base'}`}>Settings</span>
          </button>

          <button
            onClick={() => handleNavigation(`/${currentUser?.role}/notifications`)}
            className={`w-full text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700 ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}
          >
            <MdNotifications className="h-4 w-4" />
            <span className={`${isMobile ? 'text-sm' : 'text-base'}`}>Notifications</span>
          </button>

          <div className="border-t border-gray-100 my-2"></div>

          <button
            onClick={handleSignout}
            className={`w-full text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600 ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}
          >
            <MdLogout className="h-4 w-4" />
            <span className={`${isMobile ? 'text-sm' : 'text-base'}`}>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar({ onMobileSidebarToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');
  const dropdownRef = useRef(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 480) setScreenSize('mobile');
      else if (width < 768) setScreenSize('tablet');
      else if (width < 1024) setScreenSize('desktop-small');
      else setScreenSize('desktop');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const isMobile = screenSize === 'mobile' || screenSize === 'tablet'; // Show hamburger for tablets too
  const isTablet = screenSize === 'tablet';

  return (
    <header 
      className={`relative flex items-center justify-between shadow-xl w-full bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200/50 backdrop-blur-sm ${
        isMobile ? 'px-3 py-3 min-h-[70px]' : 
        isTablet ? 'px-4 py-4 min-h-[80px]' : 
        'px-6 py-5 min-h-[90px]'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className={`absolute top-0 left-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl ${
          isMobile ? 'w-20 h-20' : 'w-32 h-32'
        }`}></div>
        <div className={`absolute bottom-0 right-0 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full blur-3xl ${
          isMobile ? 'w-16 h-16' : 'w-24 h-24'
        }`}></div>
      </div>

      {/* Mobile/Tablet Hamburger Menu - Shows for screens < 768px */}
      <div className="md:hidden">
        <button
          onClick={onMobileSidebarToggle}
          className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 z-20"
        >
          <MdMenu className="text-gray-700 h-6 w-6" />
        </button>
      </div>

      {/* Left Section - Welcome Status */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10">
        <WelcomeStatus 
          currentTime={currentTime} 
          isMobile={isMobile} 
          isTablet={isTablet} 
        />
      </div>

      {/* Right Section - Actions and Profile */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative z-10">
        <ActionBar 
          isMobile={isMobile} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
          notificationCount={notificationCount} 
        />
        <ProfileMenu 
          isMobile={isMobile}
          dropdownOpen={dropdownOpen}
          toggleDropdown={toggleDropdown}
          dropdownRef={dropdownRef}
        />
      </div>
    </header>
  );
}