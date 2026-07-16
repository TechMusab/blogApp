import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthSession, AuthState } from '../../../types'

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthSession>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
