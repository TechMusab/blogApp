import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import authReducer from './slices/auth/authSlice'
import postsReducer from './slices/posts/postsSlice'
import uiReducer from './slices/ui/uiSlice'
import savedPostsReducer, { clearSaved, toggleSaved } from './slices/savedPosts/savedPostsSlice'
import themeReducer, { setTheme, toggleTheme } from './slices/theme/themeSlice'
import { SavedPostsService } from '../services/SavedPostsService'
import { ThemeService } from '../services/ThemeService'
import type { Theme } from '../services/ThemeService'
import type { Post } from '../types'
import postsData from '../shared/data/posts.json'

// ── localStorage helpers ──────────────────────────────────────────────────────
const POSTS_KEY = 'folio:posts'

function loadPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY)
    if (raw) return JSON.parse(raw) as Post[]
  } catch {
    // corrupted data — fall through to seed
  }
  return postsData as Post[]
}

function savePosts(posts: Post[]): void {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────
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
    posts: loadPosts(),
    savedPosts: { savedPostIds: SavedPostsService.getSavedPosts() },
    theme: { theme: ThemeService.getTheme() },
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistenceListener.middleware),
})

// Persist posts slice to localStorage whenever it changes
let previousPosts = store.getState().posts
store.subscribe(() => {
  const currentPosts = store.getState().posts
  if (currentPosts !== previousPosts) {
    previousPosts = currentPosts
    savePosts(currentPosts)
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

persistenceListener.startListening({
  matcher: (action) => toggleSaved.match(action) || clearSaved.match(action),
  effect: (_, api) => SavedPostsService.save((api.getState() as { savedPosts: { savedPostIds: string[] } }).savedPosts.savedPostIds),
})
persistenceListener.startListening({
  matcher: (action) => toggleTheme.match(action) || setTheme.match(action),
  effect: (_, api) => {
    const theme = (api.getState() as { theme: { theme: Theme } }).theme.theme
    ThemeService.setTheme(theme)
    ThemeService.applyTheme(theme)
  },
})
