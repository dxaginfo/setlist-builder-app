import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import songsReducer from './slices/songsSlice';
import setlistsReducer from './slices/setlistsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    songs: songsReducer,
    setlists: setlistsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;