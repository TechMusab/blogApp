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
    updateUser: (state, action: PayloadAction<{ name?: string; avatar?: string }>) => {
      if (state.user) {
        if (action.payload.name) state.user.name = action.payload.name
        if (action.payload.avatar) state.user.avatar = action.payload.avatar
      }
    },
  },
})

export const { login, logout, updateUser } = authSlice.actions
export default authSlice.reducer
