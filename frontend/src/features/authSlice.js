import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../api/authApi';

/** Called once on app boot — reads the stored token and fetches the user from DB */
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('No token');
      const response = await authApi.getMe(); // GET /api/auth/me
      return response.user;
    } catch (error) {
      localStorage.removeItem('token'); // token is bad — clear it
      return rejectWithValue('Session expired');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response; // expects { success, user, token }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  appReady: false,   // ← true once loadUser finishes (either way)
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.appReady = true;
      localStorage.removeItem('token');
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // ── loadUser ───────────────────────────────────────────────
      .addCase(loadUser.pending, (state) => {
        state.appReady = false;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.appReady = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.appReady = true;
      })
      // ── loginUser ──────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.appReady = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;

