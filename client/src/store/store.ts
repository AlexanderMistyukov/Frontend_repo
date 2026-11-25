import { configureStore } from '@reduxjs/toolkit';
import { administrationReducer, charityReducer, userReducer } from './slices';

export const store = configureStore({
  reducer: {
    user: userReducer,
    administration: administrationReducer,
    charity: charityReducer,
  },
});
