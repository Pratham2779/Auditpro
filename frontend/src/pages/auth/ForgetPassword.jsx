// import { useState } from "react";
// import { FiMail, FiKey } from "react-icons/fi";
// import { toast } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// // Dummy email-to-OTP simulation
// const sendOtpToEmail = async (email) => {
//   return new Promise((resolve) =>
//     setTimeout(() => {
//       console.log(`OTP sent to ${email}`);
//       resolve({ success: true, message: "OTP sent to your email" });
//     }, 1000)
//   );
// };

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await sendOtpToEmail(email);
//       if (response.success) {
//         toast.success(response.message);
//         setStep(2); // Show OTP input
//       } else {
//         toast.error("Failed to send OTP.");
//       }
//     } catch (err) {
//       toast.error("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = (e) => {
//     e.preventDefault();

//     // Basic hardcoded OTP for demo
//     if (otp === "123456") {
//       toast.success("OTP verified! Redirecting...");
//       setTimeout(() => navigate("/reset-password"), 1500);
//     } else {
//       toast.error("Invalid OTP.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-5">
//       <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 space-y-8 border border-gray-100">
//         <h2 className="text-2xl font-bold text-center text-gray-800">
//           Forgot Password
//         </h2>

//         <form
//           onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}
//           className="space-y-5"
//         >
//           {/* Email Input */}
//           {step === 1 && (
//             <div className="relative">
//               <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full pl-11 pr-4 py-3 text-[18px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
//               />
//             </div>
//           )}

//           {/* OTP Input */}
//           {step === 2 && (
//             <div className="relative">
//               <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 required
//                 className="w-full pl-11 pr-4 py-3 text-[18px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
//               />
//             </div>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 text-[17px] font-semibold rounded-xl shadow-md transition ${
//               loading
//                 ? "bg-gray-400 cursor-not-allowed text-white"
//                 : "bg-indigo-600 hover:bg-indigo-700 text-white"
//             }`}
//           >
//             {loading
//               ? "Please wait..."
//               : step === 1
//               ? "Send OTP"
//               : "Verify OTP"}
//           </button>

//           {/* Back to Login */}
//           <div className="text-center text-[15px]">
//             <span className="text-gray-600">Remember your password? </span>
//             <button
//               type="button"
//               onClick={() => navigate("/")}
//               className="text-indigo-600 font-medium hover:underline"
//             >
//               Login
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { verifyEmail, verifyEmailExternal } from "../../services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await verifyEmailExternal({email});
    setLoading(false);
    if (success) {
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-5">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 space-y-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 text-[18px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-[17px] font-semibold rounded-xl shadow-md transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
          <div className="text-center text-[15px]">
            <span className="text-gray-600">Remember your password? </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-indigo-600 font-medium hover:underline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}