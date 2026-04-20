import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as studentsApi from '../api/studentsApi';

export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await studentsApi.getStudents(params);
      return response; // expects { success, data, total, page, totalPages }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
  }
);

const initialState = {
  list: [],
  selectedStudent: null,
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, totalPages: 1 }
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSelectedStudent } = studentsSlice.actions;
export default studentsSlice.reducer;
