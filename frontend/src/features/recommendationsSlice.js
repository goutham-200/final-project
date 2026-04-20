import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as recommendationsApi from '../api/recommendationsApi';

export const fetchByStudent = createAsyncThunk(
  'recommendations/fetchByStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await recommendationsApi.getStudentRecommendations(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommendations');
    }
  }
);

export const generateRecommendations = createAsyncThunk(
  'recommendations/generate',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await recommendationsApi.generateRecommendations(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate recommendations');
    }
  }
);

export const rateRecommendation = createAsyncThunk(
  'recommendations/rate',
  async ({ id, rating, notes }, { rejectWithValue }) => {
    try {
      const response = await recommendationsApi.rateRecommendation(id, { rating, notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rate recommendation');
    }
  }
);

const initialState = {
  items: [],
  generating: false,
  loading: false,
  error: null
};

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchByStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchByStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchByStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateRecommendations.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateRecommendations.fulfilled, (state, action) => {
        state.generating = false;
        state.items = action.payload; // Typically replaces the list 
      })
      .addCase(generateRecommendations.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })
      .addCase(rateRecommendation.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload; // Update the single item
        }
      });
  }
});

export const { clearRecommendations } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;
