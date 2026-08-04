import './DashboardNavbar.scss';

import { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Mail, Bookmark, Menu, Pen, Settings, LogOut } from 'lucide-react';
import { Dropdown } from '../Dropdown';
import { ThemeToggle } from '../ThemeToggle';
import { Avatar } from '../Avatar';
import type { RootState } from '../../../redux/store';
import { logout } from '../../../redux/slices/auth/authSlice';

export const DashboardNavbar = memo(function DashboardNavbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const goToDashboard = useCallback(() => navigate('/dashboard'), [navigate]);
  const goToCreate = useCallback(() => {
    closeMenu();
    navigate('/create');
  }, [closeMenu, navigate]);
  const goToSaved = useCallback(() => {
    closeMenu();
    navigate('/saved-posts');
  }, [closeMenu, navigate]);
  const goToYourPosts = useCallback(() => {
    closeMenu();
    navigate('/your-posts');
  }, [closeMenu, navigate]);
  const goToPeople = useCallback(() => {
    closeMenu();
    navigate('/people');
  }, [closeMenu, navigate]);
  const goToFriends = useCallback(() => {
    closeMenu();
    navigate('/friends');
  }, [closeMenu, navigate]);
  const goToFriendRequests = useCallback(() => {
    closeMenu();
    navigate('/friend-requests');
  }, [closeMenu, navigate]);
  const goToSettings = useCallback(() => {
    closeMenu();
    navigate('/settings');
  }, [closeMenu, navigate]);
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <nav className="dashboard__navbar">
      <div className="dashboard__navbar-left" onClick={goToDashboard} style={{ cursor: 'pointer' }}>
        <span className="dashboard__navbar-icon" aria-hidden="true">
          ⌁
        </span>
        <span className="dashboard__navbar-brand">Folio</span>
      </div>
      <div className="dashboard__navbar-right">
        <button type="button" className="dashboard__write-btn" onClick={goToCreate}>
          <Pen size={16} aria-hidden="true" />Write
        </button>
        <ThemeToggle />
        <div className="dashboard__profile-menu">
          <button
            type="button"
            className="dashboard__user-info"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar
              avatar={user?.avatar}
              name={user?.name}
              size="small"
              className="dashboard__avatar"
            />
            <span className="dashboard__username">{user?.name?.split(' ')[0] || 'Mara'}</span>
          </button>
          <Dropdown
            open={menuOpen}
            onClose={closeMenu}
            header={
              <div className="dropdown__profile">
                <Avatar avatar={user?.avatar} name={user?.name} size="extraLarge" />
                <span>
                  <span className="dropdown__name">{user?.name || 'Mara Voss'}</span>
                  <span className="dropdown__email">{user?.email || 'mara@folio.io'}</span>
                </span>
              </div>
            }
            items={[
              { label: 'Discover People', icon: <Search size={18} />, onClick: goToPeople },
              { label: 'Friends', icon: <Users size={18} />, onClick: goToFriends },
              { label: 'Friend Requests', icon: <Mail size={18} />, onClick: goToFriendRequests },
              { label: 'Saved posts', icon: <Bookmark size={18} />, onClick: goToSaved },
              { label: 'Your posts', icon: <Menu size={18} />, onClick: goToYourPosts },
              { label: 'Write a post', icon: <Pen size={18} />, onClick: goToCreate },
              { label: 'Account settings', icon: <Settings size={18} />, onClick: goToSettings },
            ]}
            footerItem={{ label: 'Sign out', icon: <LogOut size={18} />, danger: true, onClick: handleLogout }}
          />
        </div>
      </div>
    </nav>
  );
});
