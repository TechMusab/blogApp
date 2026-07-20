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
  const goToCreate = useCallback(() => { closeMenu(); navigate('/create') }, [closeMenu, navigate])
  const goToSaved = useCallback(() => { closeMenu(); navigate('/saved-posts') }, [closeMenu, navigate])
  const goToYourPosts = useCallback(() => { closeMenu(); navigate('/your-posts') }, [closeMenu, navigate])
  const handleLogout = useCallback(() => { dispatch(logout()); navigate('/login') }, [dispatch, navigate])
  const initials = user?.avatar || user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MV'

  return <nav className="dashboard__navbar">
    <div className="dashboard__navbar-left"><span className="dashboard__navbar-icon" aria-hidden="true">⌁</span><span className="dashboard__navbar-brand">Folio</span></div>
    <div className="dashboard__navbar-right">
      <button type="button" className="dashboard__write-btn" onClick={goToCreate}><span aria-hidden="true">✎</span>Write</button>
      <ThemeToggle />
      <div className="dashboard__profile-menu">
        <button type="button" className="dashboard__user-info" onClick={() => setMenuOpen((open) => !open)} aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={menuOpen}>
          <span className="dashboard__avatar">{initials}</span><span className="dashboard__username">{user?.name?.split(' ')[0] || 'Mara'}</span>
        </button>
        <Dropdown open={menuOpen} onClose={closeMenu}
          header={<div className="dropdown__profile"><span className="dropdown__avatar">{initials}</span><span><span className="dropdown__name">{user?.name || 'Mara Voss'}</span><span className="dropdown__email">{user?.email || 'mara@folio.io'}</span></span></div>}
          items={[{ label: 'Account settings', icon: '⚙', onClick: closeMenu }, { label: 'Saved posts', icon: '▱', onClick: goToSaved }, { label: 'Your posts', icon: '☰', onClick: goToYourPosts }, { label: 'Write a post', icon: '✎', onClick: goToCreate }]}
          footerItem={{ label: 'Sign out', icon: '⇥', danger: true, onClick: handleLogout }} />
      </div>
    </div>
  </nav>
})

