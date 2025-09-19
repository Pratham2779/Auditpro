import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  darkMode: false,
  activePath: '/'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setActivePath: (state, action) => {
      state.activePath = action.payload;
    }
  }
});

export const { 
  toggleSidebar, 
  toggleMobileSidebar, 
  closeMobileSidebar,
  toggleDarkMode,
  setActivePath
} = uiSlice.actions;

export default uiSlice.reducer;