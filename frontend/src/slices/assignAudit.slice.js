

// src/slices/assignAudit.slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllAuditlogs,
  createAuditlog,
  updateAuditlog,
  deleteAuditlog,
} from '../services/auditlog.service.js';
import { getTodayIST } from '../utils/time.js';


export const fetchTodaysAssignedAudits = createAsyncThunk(
  'assignAudit/fetchTodays',
  async (_, thunkAPI) => {
    try {
      const today = getTodayIST();
      const { auditLogs } = await getAllAuditlogs({
        auditDate: today,
        limit: 1000,
        page: 1,
        // you could also pass sortBy/sortOrder here if desired
        // sortBy: 'createdAt',
        // sortOrder: 'desc',
      });
      return auditLogs;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);



export const createAssignedAudit = createAsyncThunk(
  'assignAudit/create',
  async (formData, thunkAPI) => {
    try {
      const newAudit = await createAuditlog(formData);
      return newAudit;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);




export const updateAssignedAudit = createAsyncThunk(
  'assignAudit/update',
  async ({ id, formData }, thunkAPI) => {
    try {
      const updated = await updateAuditlog(id, formData);
      return updated;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);



export const deleteAssignedAudit = createAsyncThunk(
  'assignAudit/delete',
  async (id, thunkAPI) => {
    try {
      await deleteAuditlog(id);
      return id;
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

const assignAuditSlice = createSlice({
  name: 'assignAudit',
  initialState: {
    todaysAudit: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // FETCH
    builder
      .addCase(fetchTodaysAssignedAudits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodaysAssignedAudits.fulfilled, (state, action) => {
        state.loading = false;
        // no client-side sort any more
        state.todaysAudit = action.payload;
      })
      .addCase(fetchTodaysAssignedAudits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // CREATE
    builder
      .addCase(createAssignedAudit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignedAudit.fulfilled, (state, action) => {
        state.loading = false;
        // insert new at front—server should have given correct createdAt
        state.todaysAudit.unshift(action.payload);
      })
      .addCase(createAssignedAudit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // UPDATE
    builder
      .addCase(updateAssignedAudit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssignedAudit.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.todaysAudit.findIndex(x => x._id === action.payload._id);
        if (idx >= 0) state.todaysAudit[idx] = action.payload;
      })
      .addCase(updateAssignedAudit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // DELETE
    builder
      .addCase(deleteAssignedAudit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssignedAudit.fulfilled, (state, action) => {
        state.loading = false;
        state.todaysAudit = state.todaysAudit.filter(x => x._id !== action.payload);
      })
      .addCase(deleteAssignedAudit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});


export default assignAuditSlice.reducer;
