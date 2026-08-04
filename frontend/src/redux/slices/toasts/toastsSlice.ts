import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ToastItem = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
};

type ToastsState = {
  items: ToastItem[];
};

const initialState: ToastsState = {
  items: [],
};

const toastsSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<ToastItem, 'id'>>) => {
      const id = Date.now().toString();
      state.items.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.items = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = toastsSlice.actions;
export default toastsSlice.reducer;
