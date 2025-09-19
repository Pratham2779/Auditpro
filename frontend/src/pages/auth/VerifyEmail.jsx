// import { useState, useEffect } from "react";

// export default function VerifyEmail() {
//   const [otp, setOtp] = useState(["", "", "", ""]);
//   const [resendTimer, setResendTimer] = useState(60);

//   // Countdown timer for resend
//   useEffect(() => {
//     if (resendTimer > 0) {
//       const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [resendTimer]);

//   // Handle OTP input
//   const handleChange = (value, index) => {
//     if (!/^[0-9]?$/.test(value)) return;
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // move to next input if value is entered
//     if (value && index < 3) {
//       document.getElementById(`otp-${index + 1}`)?.focus();
//     }
//   };

//   // Submit OTP
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const code = otp.join("");
//     console.log("Submitted OTP:", code);
//     // Call backend API here
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center px-4">
//       <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 space-y-6 border border-gray-100">
//         <h2 className="text-2xl font-bold text-center text-gray-800">Verify Your Email</h2>
//         <p className="text-center text-gray-600 text-[16px]">
//           Enter the 4-digit code we sent to your email address.
//         </p>

//         {/* OTP Input */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div className="flex justify-center gap-4">
//             {otp.map((digit, index) => (
//               <input
//                 key={index}
//                 id={`otp-${index}`}
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={1}
//                 value={digit}
//                 onChange={(e) => handleChange(e.target.value, index)}
//                 className="w-14 h-14 text-center text-2xl border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             ))}
//           </div>

//           <button
//             type="submit"
//             className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[17px] font-semibold rounded-xl shadow-md transition"
//           >
//             Verify
//           </button>
//         </form>

//         {/* Resend Code */}
//         <div className="text-center text-md text-gray-600">
//           Didn't receive the code?{" "}
//           {resendTimer > 0 ? (
//             <span className="text-indigo-400 font-medium">Resend in {resendTimer}s</span>
//           ) : (
//             <button
//               onClick={() => {
//                 setOtp(["", "", "", ""]);
//                 setResendTimer(60);
//                 console.log("Resend Code");
//               }}
//               className="text-indigo-600 font-semibold hover:underline"
//             >
//               Resend Code
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

















import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiKey } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { resetPassword, verifyEmailExternal } from "../../services/auth.service";

export default function VerifyEmail() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const { search } = useLocation();
  const email = new URLSearchParams(search).get("email");

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  const handleChange = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;
    const a = [...otp];
    a[idx] = val;
    setOtp(a);
    if (val && idx < 3) document.getElementById(`otp-${idx+1}`)?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");

    

    navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${code}`);
  };

  const resend = () => {
    setTimer(60);
    toast.promise(
      verifyEmailExternal(email),
      { loading: "Resending...", success: "OTP resent", error: "Failed to resend" }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-5">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 space-y-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-800">Verify Your Email</h2>
        <p className="text-center text-gray-600 text-[16px]">Enter the 4-digit code sent to {email}</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center gap-4">
            {otp.map((d, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(e.target.value, i)}
                className="w-14 h-14 text-center text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            ))}
          </div>
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[17px] font-semibold rounded-xl shadow-md transition">
            Verify
          </button>
        </form>
        <div className="text-center text-[15px]">
          Didn't receive? {timer>0 ? (
            <span className="text-indigo-400">Resend in {timer}s</span>
          ) : (
            <button onClick={resend} className="text-indigo-600 hover:underline font-medium">Resend</button>
          )}
        </div>
      </div>
    </div>
  );
}
