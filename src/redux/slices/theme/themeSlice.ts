import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Theme } from '../../../services/ThemeService'

type ThemeState = { theme: Theme }
const initialState: ThemeState = { theme: 'dark' }
const themeSlice = createSlice({ name: 'theme', initialState, reducers: {
  toggleTheme: (state) => { state.theme = state.theme === 'dark' ? 'light' : 'dark' },
  setTheme: (state, action: PayloadAction<Theme>) => { state.theme = action.payload },
} })
export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
