import './ThemeToggle.scss'

import { memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../redux/store'
import { toggleTheme } from '../../../redux/slices/theme/themeSlice'

export const ThemeToggle = memo(function ThemeToggle() {
  const theme = useSelector((state: RootState) => state.theme.theme)
  const dispatch = useDispatch()
  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch])
  return <button type="button" className={`theme-toggle theme-toggle--${theme}`} onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
    <svg className="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 15.4A8.4 8.4 0 0 1 8.6 3.3 8.5 8.5 0 1 0 20.7 15.4Z" /></svg>
    <svg className="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
    <span className="theme-toggle__thumb" />
  </button>
})
