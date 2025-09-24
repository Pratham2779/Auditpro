import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, UserCheck, Search, Shield, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { NavLink } from "react-router-dom";
import { setRole, setCredentials } from "../../slices/auth.slice.js";
import { loginUser, getCurrentUser } from "../../services/auth.service.js";
import banner from '../../assets/banner.png';
import { CgUserList } from "react-icons/cg";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authState = useSelector((state) => state.auth);
  const user = authState.user;
  const role = authState.role || "admin"; // Default to admin if no role is set

  // Separate state for each input field
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    // Set default role to admin if none is selected
    if (!authState.role) {
      dispatch(setRole("admin"));
    }
    
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/auditor");
      }
    }
  }, [user, navigate, authState.role, dispatch]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const loginForm = {
      email: email,
      password: password,
      remember: remember,
      role: role,
    };

    try {
      await loginUser(loginForm);

      const loggedInUser = await getCurrentUser();

      if (loggedInUser) {
        dispatch(setCredentials({
          user: loggedInUser,
          role: loggedInUser.role,
          isAuthenticated: true
        }));

        if (loggedInUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/auditor");
        }
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role button click
  const handleRoleChange = (newRole) => {
    dispatch(setRole(newRole));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-3xl max-w-lg w-full p-8 space-y-6 border border-gray-100 backdrop-blur-sm">
        
        {/* Brand Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-80 h-20 rounded-xl flex items-center justify-center">
              <img src={banner} alt="Banner" className="w-72 h-auto inline-block" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-gray-700 text-lg font-medium leading-relaxed">
              <b>Welcome back!</b>
            </p>
            <p className="text-gray-500 text-base">
              <b>Please login to continue</b>
            </p>
          </div>
          
          {/* Elegant separator */}
          <div className="w-full flex items-center justify-center py-2">
            <div className="flex-grow border-t border-gray-500"></div>
            <div className="mx-4">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            </div>
            <div className="flex-grow border-t border-gray-500"></div>
          </div>
        </div>

        {/* Role Selection Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Login as
          </h2>

          {/* Enhanced Role Toggle */}
          <div className="flex justify-center space-x-3 p-2 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`
                flex-1 px-8 py-3 text-base font-semibold rounded-xl transition-all duration-300 transform flex items-center justify-center space-x-2
                ${role === "admin"
                  ? "bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-300"
                  : "bg-transparent text-gray-600 hover:bg-white hover:shadow-sm"
                }
              `}
            >
              <UserCheck className="w-5 h-5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("auditor")}
              className={`
                flex-1 px-8 py-3 text-base font-semibold rounded-xl transition-all duration-300 transform flex items-center justify-center space-x-2
                ${role === "auditor"
                  ? "bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-300"
                  : "bg-transparent text-gray-600 hover:bg-white hover:shadow-sm"
                }
              `}
            >
              <CgUserList className="h-6 w-6 mr-2" />
              <span>Auditor</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 ml-1">
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-600">Remember Me</span>
            </label>
            <NavLink
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              Forgot Password?
            </NavLink>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 transform
              ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              }
              text-white
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-4 space-y-2">
          <p className="text-sm text-gray-500">
            Secure login powered by advanced authentication
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>SSL Encrypted</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Secure Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}