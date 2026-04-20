import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import studentsReducer from './features/studentsSlice';
import strategiesReducer from './features/strategiesSlice';
import recommendationsReducer from './features/recommendationsSlice';
import usersReducer from './features/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentsReducer,
    strategies: strategiesReducer,
    recommendations: recommendationsReducer,
    users: usersReducer,
  },
});
