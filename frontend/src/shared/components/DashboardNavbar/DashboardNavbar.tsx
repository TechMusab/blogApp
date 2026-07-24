import './DashboardNavbar.scss'

import { memo, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from '../Dropdown'
import { ThemeToggle } from '../ThemeToggle'
import type { RootState } from '../../../redux/store'
import { logout } from '../../../redux/slices/auth/authSlice'

export const DashboardNavbar = memo(function DashboardNavbar() {
  const user = useSelector((state: RootState) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const goToDashboard = useCallback(() => navigate('/dashboard'), [navigate])
  const goToCreate = useCallback(() => { closeMenu(); navigate('/create') }, [closeMenu, navigate])
  const goToSaved = useCallback(() => { closeMenu(); navigate('/saved-posts') }, [closeMenu, navigate])
  const goToYourPosts = useCallback(() => { closeMenu(); navigate('/your-posts') }, [closeMenu, navigate])
  const goToSettings = useCallback(() => { closeMenu(); navigate('/settings') }, [closeMenu, navigate])
  const handleLogout = useCallback(() => { dispatch(logout()); navigate('/login') }, [dispatch, navigate])
  const initials = user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MV'
  const avatarUrl = user?.avatar
  const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5191'

  const renderAvatar = (className: string) => {
    if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
      const fullUrl = avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND_BASE_URL}${avatarUrl}`
      return <img src={fullUrl} alt="Avatar" className={className} />
    }
    return <span className={className}>{initials}</span>
  }

  return <nav className="dashboard__navbar">
    <div className="dashboard__navbar-left" onClick={goToDashboard} style={{ cursor: 'pointer' }}><span className="dashboard__navbar-icon" aria-hidden="true">⌁</span><span className="dashboard__navbar-brand">Folio</span></div>
    <div className="dashboard__navbar-right">
      <button type="button" className="dashboard__write-btn" onClick={goToCreate}><span aria-hidden="true">✎</span>Write</button>
      <ThemeToggle />
      <div className="dashboard__profile-menu">
        <button type="button" className="dashboard__user-info" onClick={() => setMenuOpen((open) => !open)} aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={menuOpen}>
          {renderAvatar('dashboard__avatar')}<span className="dashboard__username">{user?.name?.split(' ')[0] || 'Mara'}</span>
        </button>
        <Dropdown open={menuOpen} onClose={closeMenu}
          header={<div className="dropdown__profile">{renderAvatar('dropdown__avatar')}<span><span className="dropdown__name">{user?.name || 'Mara Voss'}</span><span className="dropdown__email">{user?.email || 'mara@folio.io'}</span></span></div>}
          items={[{ label: 'Account settings', icon: '⚙', onClick: goToSettings }, { label: 'Saved posts', icon: '▱', onClick: goToSaved }, { label: 'Your posts', icon: '☰', onClick: goToYourPosts }, { label: 'Write a post', icon: '✎', onClick: goToCreate }]}
          footerItem={{ label: 'Sign out', icon: '⇥', danger: true, onClick: handleLogout }} />
      </div>
    </div>
  </nav>
})

