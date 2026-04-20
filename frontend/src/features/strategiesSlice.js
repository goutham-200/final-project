import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as strategiesApi from '../api/strategiesApi';

export const fetchStrategies = createAsyncThunk(
  'strategies/fetchStrategies',
  async (params, { rejectWithValue }) => {
    try {
      const response = await strategiesApi.getStrategies(params);
      return response.data; // expects array of strategies
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch strategies');
    }
  }
);

const initialState = {
  list: [],
  filters: { learningStyle: "", subject: "", difficulty: "" },
  loading: false,
  error: null
};

const strategiesSlice = createSlice({
  name: 'strategies',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { learningStyle: "", subject: "", difficulty: "" };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStrategies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStrategies.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchStrategies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilter, clearFilters } = strategiesSlice.actions;
export default strategiesSlice.reducer;
