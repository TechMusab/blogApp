import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import authReducer, { login, logout } from './slices/auth/authSlice'
import postsReducer from './slices/posts/postsSlice'
import uiReducer from './slices/ui/uiSlice'
import savedPostsReducer from './slices/savedPosts/savedPostsSlice'
import themeReducer, { setTheme, toggleTheme } from './slices/theme/themeSlice'
import { ThemeService } from '../services/ThemeService'
import { AuthService } from '../services/AuthService'
import type { Theme } from '../services/ThemeService'

const persistenceListener = createListenerMiddleware()

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    ui: uiReducer,
    savedPosts: savedPostsReducer,
    theme: themeReducer,
  },
  preloadedState: {
    auth: (() => {
      const session = AuthService.loadSession()
      return session
        ? { user: session.user, token: session.token, isAuthenticated: true }
        : { user: null, token: null, isAuthenticated: false }
    })(),
    posts: [],
    savedPosts: { savedPostIds: [] },
    theme: { theme: ThemeService.getTheme() },
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistenceListener.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

persistenceListener.startListening({
  matcher: (action) => toggleTheme.match(action) || setTheme.match(action),
  effect: (_, api) => {
    const theme = (api.getState() as { theme: { theme: Theme } }).theme.theme
    ThemeService.setTheme(theme)
    ThemeService.applyTheme(theme)
  },
})

persistenceListener.startListening({
  matcher: (action) => login.match(action) || logout.match(action),
  effect: (action) => {
    if (login.match(action)) {
      AuthService.saveSession(action.payload)
      return
    }

    AuthService.clearSession()
  },
})
