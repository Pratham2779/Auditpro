import { useState, useEffect } from 'react';
import {
  MdPerson,
  MdChevronRight,
  MdClose,
  MdTimeline,
  MdLogout,
  MdMenu,
  MdMenuOpen
} from 'react-icons/md';
import logo from '../../assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../services/auth.service';
import { logout } from '../../slices/auth.slice';
import { useDispatch, useSelector } from 'react-redux';

function Sidebar({ menuItems = [], role, mobileSidebarOpen, onMobileSidebarClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItem, setActiveItem] = useState(0);

  // Update active item based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const matchingIndex = menuItems.findIndex(item => {
      if (item.path === currentPath) return true;
      // Handle nested routes - if current path starts with menu item path
      if (currentPath.startsWith(item.path) && item.path !== '/') return true;
      return false;
    });
    
    if (matchingIndex !== -1) {
      setActiveItem(matchingIndex);
    }
  }, [location.pathname, menuItems]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeMobileSidebar = () => {
    if (onMobileSidebarClose) {
      onMobileSidebarClose();
    }
  };

  const handleLogout = async () => {
    console.log('entered into logout function');
    await logoutUser();
    dispatch(logout());
    navigate('/');
  };

  const handleItemClick = async (index, item) => {
    if (item.name === 'Logout') {
      handleLogout();
      return;
    }
    setActiveItem(index);
    closeMobileSidebar(); // Close mobile sidebar when item is clicked
    navigate(item.path);
  };

  const handleMouseEnter = (index) => {
    setHoveredItem(index);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const currentUser = useSelector((state) => state.auth.user);

  return (
    <>
      {/* Mobile Backdrop - shows when mobile sidebar is open */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:static z-50 h-screen shadow-2xl border-r border-gray-700/50
          ${sidebarOpen ? 'w-64 md:w-85' : 'w-20'}
          ${mobileSidebarOpen ? 'left-0' : '-left-full'}
          md:left-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col
          backdrop-blur-xl bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900`}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Top Section with Logo and Toggle Button */}
        <div className="relative flex items-center gap-3 px-4 pt-6 pb-4">
          {!sidebarOpen ? (
            // Show only toggle button when sidebar is collapsed (desktop only)
            <button
              onClick={toggleSidebar}
              className="group p-3 rounded-xl hover:bg-gray-700/50 text-white w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <MdMenu className="h-6 w-6 group-hover:text-purple-400 transition-colors" />
            </button>
          ) : (
            // Show full header when sidebar is open
            <>
              <div className="relative">
                {/* <div className="rounded-xl p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 text-white shadow-lg">
                  <MdTimeline className="h-6 w-6" />
                </div> */}
              <div
                    className={`rounded-2xl text-white shadow-lg h-12 w-12 p-3`}
                    style={{
                      backgroundImage: `url(${logo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                  </div>


                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{role} Panel</h2>
                <p className="text-sm text-gray-300 truncate">Management Dashboard</p>
              </div>

              {/* Desktop collapse button */}
              <button
                onClick={toggleSidebar}
                className="group hidden md:flex w-10 h-10 items-center justify-center rounded-lg hover:bg-gray-700/50 transition-all duration-200 hover:scale-105"
              >
                <MdMenuOpen className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </>
          )}

          {/* Mobile close button - only show when mobile sidebar is open */}
          {mobileSidebarOpen && (
            <button
              onClick={closeMobileSidebar}
              className="absolute top-6 right-4 md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all"
            >
              <MdClose className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Divider Line */}
        <div className="relative mx-4 mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 flex flex-col gap-2 flex-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = activeItem === index;

            return (
              <button
                key={item.name}
                onClick={() => handleItemClick(index, item)}
                className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-medium text-sm w-full
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  } ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <span className={`text-xl transition-all duration-200 ${isActive ? 'text-purple-400' : 'group-hover:text-purple-400'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="flex-1 truncate text-left">{item.name}</span>
                )}
                {sidebarOpen && isActive && (
                  <MdChevronRight className="h-4 w-4 text-purple-400" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full"></div>
                )}
                {hoveredItem === index && !isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto px-4 pb-6 space-y-4">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 text-red-400 px-3 py-3 rounded-xl hover:bg-red-900/20 w-full transition-all duration-200 hover:text-red-300 border border-transparent hover:border-red-500/30"
          >
            <MdLogout className="text-xl group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>

          {/* User Profile - shown when sidebar is open */}
          {sidebarOpen && (
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-4 rounded-2xl border border-gray-600/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="h-12 w-12 flex items-center justify-center text-white font-bold rounded-xl shadow-lg bg-gradient-to-br from-emerald-400 to-teal-500"
                    style={{
                      backgroundImage: `url(${currentUser?.avatar?.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!currentUser?.avatar?.url && 'A'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{currentUser.role} User</p>
                  <p className="text-sm text-gray-300 truncate">{currentUser?.email}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-600/50">
                  <MdPerson className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Collapsed User Avatar - shown when sidebar is collapsed */}
          {!sidebarOpen && (
            <div className="flex justify-center">
              <div className="relative">
                <div
                  className="h-12 w-12 flex items-center justify-center text-white font-bold rounded-xl shadow-lg bg-gradient-to-br from-emerald-400 to-teal-500"
                  style={{
                    backgroundImage: `url(${currentUser?.avatar?.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!currentUser?.avatar?.url && 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;






