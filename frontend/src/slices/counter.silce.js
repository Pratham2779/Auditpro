import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllCounter,
  createCounter,
  updateCounter,
  deleteCounter
} from '../services/counter.service.js';

// Thunks
export const fetchCounter = createAsyncThunk(
  'counter/fetchAll',
  async (_, thunkAPI) => {
    try {
      const counters = await getAllCounter();
      return counters;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addCounter = createAsyncThunk(
  'counter/add',
  async (formData, thunkAPI) => {
    try {
      const newCounter = await createCounter(formData);
      // refresh list
      thunkAPI.dispatch(fetchCounter());
      return newCounter;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const editCounter = createAsyncThunk(
  'counter/edit',
  async ({ id, formData }, thunkAPI) => {
    try {
      const updated = await updateCounter(id, formData);
      // refresh list
      thunkAPI.dispatch(fetchCounter());
      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const removeCounter = createAsyncThunk(
  'counter/remove',
  async (id, thunkAPI) => {
    try {
      const deleted = await deleteCounter(id);
      // refresh list
      thunkAPI.dispatch(fetchCounter());
      return deleted;
      
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    allCounter: [],
    loadingCounter: false,
    counterError: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCounter.pending, (state) => {
        state.loadingCounter = true;
        state.counterError = null;
      })
      .addCase(fetchCounter.fulfilled, (state, action) => {
        state.loadingCounter = false;
        state.allCounter = action.payload;
      })
      .addCase(fetchCounter.rejected, (state, action) => {
        state.loadingCounter = false;
        state.counterError = action.payload || action.error.message;
      });
  }
});

export default counterSlice.reducer;
