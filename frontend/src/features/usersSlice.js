import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as usersApi from '../api/usersApi';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUsers();
      return response.data; // array of users
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      await usersApi.createUser(userData);
      // Refetch full list from DB so state is always in sync
      dispatch(fetchUsers());
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await usersApi.deleteUser(id);
      dispatch(fetchUsers());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { dispatch, rejectWithValue }) => {
    try {
      await usersApi.updateUser(id, userData);
      dispatch(fetchUsers());
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state) => {
        // list is re-fetched by fetchUsers dispatch inside thunk
      })
      .addCase(deleteUser.fulfilled, (state) => {
        // list is re-fetched by fetchUsers dispatch inside thunk
      });
  }
});

export default usersSlice.reducer;
