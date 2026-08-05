import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type UIState = {
  mobileMenuOpen: boolean;
  activeTab: 'my-posts' | 'saved' | 'community';
  sortOrder: 'latest' | 'popular';
  searchQuery: string;
  activeCategory: string;
};

const initialState: UIState = {
  mobileMenuOpen: false,
  activeTab: 'community',
  sortOrder: 'latest',
  searchQuery: '',
  activeCategory: 'All',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setActiveTab: (state, action: PayloadAction<UIState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<UIState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveCategory: (state, action: PayloadAction<string>) => {
      state.activeCategory = action.payload;
    },
  },
});

export const { toggleMobileMenu, setActiveTab, setSortOrder, setSearchQuery, setActiveCategory } =
  uiSlice.actions;
export default uiSlice.reducer;
