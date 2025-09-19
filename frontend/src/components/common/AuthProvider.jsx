import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../services/auth.service.js";
import { setCredentials } from "../../slices/auth.slice.js";
import Loader from "./Loader";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true); 

useEffect(() => {
  const fetchUser = async () => {
    try {
      const startTime = Date.now();

      if (!user) {
        const currentUser = await getCurrentUser();

        if (currentUser) {
          dispatch(setCredentials(
            { user: currentUser,
              role: currentUser.role,
              isAuthenticated: true
             }));

          if (location.pathname === "/") {
            navigate(currentUser.role === "admin" ? "/admin" : "/auditor");
          }
        } else {
          if (location.pathname !== "/") {
            navigate("/");
          }
        }
      }

      //  Ensure loader shows for at least 500ms
      const elapsed = Date.now() - startTime;
      const remaining = 500 - elapsed;
      if (remaining > 0) {
        await new Promise((res) => setTimeout(res, remaining));
      }

    } catch (error) {
      console.error("Session invalid or expired:", error);
      if (location.pathname !== "/") {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

  if (loading) return <Loader />;

  return children;
}
