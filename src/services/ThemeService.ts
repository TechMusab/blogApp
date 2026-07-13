export type Theme = 'dark' | 'light'
const STORAGE_KEY = 'folio:theme'

export const ThemeService = {
  getTheme(): Theme {
    try { return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark' } catch { return 'dark' }
  },
  setTheme(theme: Theme): void {
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* storage unavailable */ }
  },
  applyTheme(theme: Theme): void { document.documentElement.dataset.theme = theme },
}
