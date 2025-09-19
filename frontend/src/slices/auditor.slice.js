import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../services/user.service.js';

// Thunks
export const fetchAuditors = createAsyncThunk(
  'auditor/fetchAll',
  async (_, thunkAPI) => {
    try {
      const auditors = await getAllUsers({ role: 'auditor' });
      return auditors;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addAuditor = createAsyncThunk(
  'auditor/add',
  async (formData, thunkAPI) => {
    try {
      const newAuditor = await createUser(formData);
      thunkAPI.dispatch(fetchAuditors());
      return newAuditor;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const editAuditor = createAsyncThunk(
  'auditor/edit',
  async ({ id, formData }, thunkAPI) => {
    try {
      const updatedAuditor = await updateUser(id, formData);
      thunkAPI.dispatch(fetchAuditors());
      return updatedAuditor;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const removeAuditor = createAsyncThunk(
  'auditor/remove',
  async (id, thunkAPI) => {
    try {
      const deletedAuditor = await deleteUser(id);
      thunkAPI.dispatch(fetchAuditors());
      return deletedAuditor;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Slice
const auditorSlice = createSlice({
  name: 'auditor',
  initialState: {
    allAuditors: [],
    loadingAuditor: false,
    auditorError: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditors.pending, (state) => {
        state.loadingAuditor = true;
        state.auditorError = null;
      })
      .addCase(fetchAuditors.fulfilled, (state, action) => {
        state.loadingAuditor = false;
        state.allAuditors = action.payload;
      })
      .addCase(fetchAuditors.rejected, (state, action) => {
        state.loadingAuditor = false;
        state.auditorError = action.payload || action.error.message;
      });
  }
});

export default auditorSlice.reducer;
