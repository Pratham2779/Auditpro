
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,             // Stores full user info (_id, name, email, role, etc.)
  role: null,             // Helpful for role-based routing
  isAuthenticated: false, // Flag to check if user is logged in
};

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.user?.role || null;
      state.isAuthenticated = true;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setRole, logout } = AuthSlice.actions;
export default AuthSlice.reducer;








