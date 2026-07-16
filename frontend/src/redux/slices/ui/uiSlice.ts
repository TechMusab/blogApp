import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type UIState = {
  mobileMenuOpen: boolean
  theme: 'dark' | 'light'
  activeTab: 'latest' | 'popular'
  searchQuery: string
  activeCategory: string
}

const initialState: UIState = {
  mobileMenuOpen: false,
  theme: 'dark',
  activeTab: 'latest',
  searchQuery: '',
  activeCategory: 'All',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setActiveTab: (state, action: PayloadAction<UIState['activeTab']>) => {
      state.activeTab = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload
    },
  },
})

export const { toggleMobileMenu, setActiveTab, setSearchQuery, setActiveCategory } = uiSlice.actions
export default uiSlice.reducer
