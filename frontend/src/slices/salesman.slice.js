import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllSalesman,
  createSalesman,
  updateSalesman,
  deleteSalesman
} from '../services/salesman.service.js';

// Thunks
export const fetchSalesman = createAsyncThunk(
  'salesman/fetchAll',
  async (_, thunkAPI) => {
    try {
      const salesman= await getAllSalesman();
      return salesman;

    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addSalesman = createAsyncThunk(
  'salesman/add',
  async (formData, thunkAPI) => {
    try {
      const newSalesman = await createSalesman(formData);
      thunkAPI.dispatch(fetchSalesman());
      return newSalesman;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const editSalesman = createAsyncThunk(
  'salesman/edit',
  async ({ id, formData }, thunkAPI) => {
    try {
      const updated = await updateSalesman(id, formData);
      thunkAPI.dispatch(fetchSalesman());
      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const removeSalesman = createAsyncThunk(
  'salesman/remove',
  async (id, thunkAPI) => {
    try {
      const deleted = await deleteSalesman(id);
      thunkAPI.dispatch(fetchSalesman());
      return deleted;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Slice
const salesmanSlice = createSlice({
  name: 'salesman',
  initialState: {
    allSalesman: [],
    loadingSalesman: false,
    salesmanError: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesman.pending, (state) => {
        state.loadingSalesman = true;
        state.salesmanError = null;
      })
      .addCase(fetchSalesman.fulfilled, (state, action) => {
        state.loadingSalesman = false;
        state.allSalesman = action.payload;
      })
      .addCase(fetchSalesman.rejected, (state, action) => {
        state.loadingSalesman = false;
        state.salesmanError = action.payload || action.error.message;
      });
  }
});

export default salesmanSlice.reducer;
