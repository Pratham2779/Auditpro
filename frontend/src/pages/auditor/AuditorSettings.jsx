
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser, verifyEmail, resetPassword } from '../../services/auth.service.js';
import { updateUser } from '../../services/user.service.js';
import { setCredentials } from '../../slices/auth.slice.js';
import { toast } from 'react-hot-toast';

export default function AuditorSettings() {
  const [loading,setLoading]=useState(true);

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: 'Male',
    role: 'auditor',
    avatar: null,
  });

  const [preview, setPreview] = useState('');
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    language: 'English',
    timezone: 'Asia/Kolkata',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  // refs to store initial values
  const initialProfile = useRef(null);
  const initialSettings = useRef(null);

  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (user) {
          dispatch(setCredentials({ user }));
          const loadedProfile = {
            fullName: user.fullName || user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            gender: user.gender || 'Male',
            role: user.role || 'auditor',
            avatar: null,
          };
          setProfile(loadedProfile);
          setPreview(user.avatar?.url || '');
          initialProfile.current = loadedProfile;
          initialSettings.current = {
            language: 'English',
            timezone: 'Asia/Kolkata',
          };
        }
        setLoading(false);
      } catch {
        toast.error('Failed to load profile');
      }
    })();
  }, [dispatch]);

  const handleProfileChange = e => {
    const { name, files, value } = e.target;
    if (name === 'avatar') {
      const file = files[0] || null;
      setProfile(p => ({ ...p, avatar: file }));
      setPreview(file ? URL.createObjectURL(file) : preview);
    } else {
      setProfile(p => ({ ...p, [name]: value }));
    }
  };

  const handleSettingsChange = e => {
    const { name, type, value, checked } = e.target;
    setSettings(s => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    try {
      if (await verifyEmail()) {
        setIsOtpSent(true);
        toast.success('OTP sent to your email!');
      }
    } catch {
      toast.error('Failed to send OTP');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleSubmit = async () => {
    // Password reset if requested
    if (settings.password || settings.confirmPassword) {
      if (!otp) {
        toast.error('Please enter the OTP sent to your email');
        return;
      }
      if (settings.password !== settings.confirmPassword) {
        toast.error('Passwords do not match!');
        return;
      }
      setIsSaving(true);
      try {
        await resetPassword({ otp, newPassword: settings.password });
        toast.success('Password reset successfully!');
        setSettings(s => ({ ...s, password: '', confirmPassword: '' }));
        setOtp('');
        setIsOtpSent(false);
      } catch {
        toast.error('Password reset failed');
        setIsSaving(false);
        return;
      }
    }

    // detect changes
    const profInit = initialProfile.current;
    const setInit = initialSettings.current;
    const profileChanged =
      profInit &&
      (profile.fullName !== profInit.fullName ||
        profile.phoneNumber !== profInit.phoneNumber ||
        profile.gender !== profInit.gender ||
        profile.avatar);
    const settingsChanged =
      setInit &&
      (settings.language !== setInit.language ||
        settings.timezone !== setInit.timezone);

    if (!profileChanged && !settingsChanged) {
      toast('No changes to save');
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    if (profileChanged) {
      formData.append('fullName', profile.fullName);
      formData.append('phoneNumber', profile.phoneNumber);
      formData.append('gender', profile.gender);
      if (profile.avatar) formData.append('avatar', profile.avatar);
    }
    if (settingsChanged) {
      formData.append('language', settings.language);
      formData.append('timezone', settings.timezone);
    }

    try {
      const updated = await updateUser(currentUser._id, formData);
      if (updated && !updated.message) {
        dispatch(setCredentials({ user: updated }));
        toast.success('Changes saved successfully!');
        // update refs
        initialProfile.current = {
          ...initialProfile.current,
          fullName: updated.fullName,
          phoneNumber: updated.phoneNumber,
          gender: updated.gender,
        };
        initialSettings.current = {
          ...initialSettings.current,
          language: updated.language,
          timezone: updated.timezone,
        };
        setPreview(updated.avatar?.url || preview);
      } else {
        throw new Error(updated.message);
      }
    } catch (e) {
      toast.error(e.message || 'Profile update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const inputBase =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-sm bg-white transition-all duration-200 hover:shadow-md';
  const selectBase = inputBase + ' appearance-none cursor-pointer';



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-base">Loading Settings...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {profile.role} Settings
          </h1>
          <p className="text-gray-600 text-base">
            Manage your profile and account preferences
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-10">
            {/* Profile Details */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Profile Information
                </h3>
              </div>

              {/* Profile Image Upload */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h4 className="font-medium text-gray-700">Profile Photo</h4>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={
                        preview ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          profile.fullName
                        )}&background=6366f1&color=fff&size=96`
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shadow-md">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        name="avatar"
                        onChange={handleProfileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or GIF. Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    className={inputBase}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    className={inputBase}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleProfileChange}
                    placeholder="+91 9876543210"
                    className={inputBase}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleProfileChange}
                    className={selectBase}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={profile.role}
                    onChange={handleProfileChange}
                    className={selectBase}
                    disabled
                  >
                    <option value={profile.role}>{profile.role}</option>
                  
                  </select>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Preferences
                </h3>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <select
                      name="language"
                      value={settings.language}
                      onChange={handleSettingsChange}
                      className={selectBase}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleSettingsChange}
                      className={selectBase}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Dubai">Asia/Dubai</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Change Password */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Security
                </h3>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                {/* Email Verification Section */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Email Verification
                        </h4>
                        <p className="text-sm text-gray-600">
                          Enter the OTP sent to your email to change your
                          password.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSendOTP}
                      disabled={isSendingOTP}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isSendingOTP
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isSendingOTP ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {/* OTP Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    OTP
                  </label>
                  <input
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="Enter OTP sent to your email"
                    className={inputBase}
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={settings.password}
                      onChange={handleSettingsChange}
                      placeholder="Enter new password"
                      className={inputBase}
                      disabled={!isOtpSent}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={settings.confirmPassword}
                      onChange={handleSettingsChange}
                      placeholder="Confirm new password"
                      className={inputBase}
                      disabled={!isOtpSent}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Submit Button */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
