import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import userReducer from './slices/userSlice';
import authReducer from './slices/authSlice';
import messageReducer from './slices/messageSlice';
import languageReducer from './slices/languageSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    users: userReducer,
    auth: authReducer,
    messages: messageReducer,
    language: languageReducer,
  },
});
