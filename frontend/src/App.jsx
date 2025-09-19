// src/App.jsx
import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { getCurrentUser } from './services/auth.service';
import { setCredentials } from './slices/auth.slice';

import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/auth/Login';
import AuthProvider from './components/common/AuthProvider';
import ForgotPassword from './pages/auth/ForgetPassword';

// Super Admin
import SuperAdminLayout from './layouts/SuperAdminLayout';
import AdminDashboard from './pages/superAdmin/AdminDashboard';
import AssignAudits from './pages/superAdmin/AssignAudits';
import AdminAuditHistory from './pages/superAdmin/AdminAuditHistory';
import ManagePersonnel from './pages/superAdmin/ManagePersonnel';
import AdminNotifications from './pages/superAdmin/AdminNotifications';
import AdminSettings from './pages/superAdmin/AdminSettings';
import AdminAuditOverview from './pages/superAdmin/AdminAuditOverview';

// Auditor
import AuditorLayout from './layouts/AuditorLayout';
import AuditorDashboard from './pages/auditor/AuditorDashboard';
import MyAudits from './pages/auditor/MyAudits';
import AuditorAuditHistory from './pages/auditor/AuditorAuditHistory';
import AuditorSettings from './pages/auditor/AuditorSettings';
import AuditorNotification from './pages/auditor/AuditorNotifications';
import AuditorAuditOverview from './pages/auditor/AuditorAuditOverview';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';
import { useRef } from 'react';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasFetchedUser = useRef(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchUserOnRefresh = async () => {
       if (hasFetchedUser.current) return; 
       hasFetchedUser.current = true;
      try {
        if (!user) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            dispatch(setCredentials({ user: currentUser }));
            if (currentUser.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/auditor");
            }
          }
        }
      } catch (err) {
        console.error("Session expired or not logged in:", err);
      }
    };

    fetchUserOnRefresh();
  }, [user, dispatch, navigate]);


  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path='/verify-email' element={<VerifyEmail/>}/>
         <Route path='/reset-password' element={<ResetPassword/>}/>
        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<SuperAdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="assign-audits" element={<AssignAudits />} />
            <Route path="audit-history" element={<AdminAuditHistory />} />
            <Route path="manage-personnel" element={<ManagePersonnel />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="logout" element={<Login />} />
            <Route path="adminAuditOverview" element={<AdminAuditOverview />} />
          </Route>
        </Route>

        {/* Auditor Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['auditor']} />}>
          <Route path="/auditor" element={<AuditorLayout />}>
            <Route index element={<AuditorDashboard />} />
            <Route path="dashboard" element={<AuditorDashboard />} />
            <Route path="my-audits" element={<MyAudits />} />
            <Route path="audit-history" element={<AuditorAuditHistory />} />
            <Route path="settings" element={<AuditorSettings />} />
            <Route path="logout" element={<Login />} />
            <Route path="notifications" element={<AuditorNotification />} />
            <Route path="auditorAuditOverview" element={<AuditorAuditOverview />} />
          </Route>
        </Route>
      </Routes>

      <Toaster position="top-center" />
    </AuthProvider>
  );
}

export default App;
