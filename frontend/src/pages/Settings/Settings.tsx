import './Settings.scss'

import { memo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { DashboardNavbar } from '../../shared/components/DashboardNavbar'
import type { RootState } from '../../redux/store'
import { logout, updateUser } from '../../redux/slices/auth/authSlice'
import { UserService } from '../../services/UserService'

export const SettingsPage = memo(function SettingsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5191'
  
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Sync local state with Redux state
  useEffect(() => {
    if (user?.name) setName(user.name)
    if (user?.avatar !== undefined) setAvatar(user.avatar)
  }, [user])

  const getAvatarUrl = (url?: string) => {
    if (!url) return ''
    return url.startsWith('http') ? url : `${BACKEND_BASE_URL}${url}`
  }

  const handleAvatarUpload = async (file: File) => {
    console.log('=== SETTINGS AVATAR UPLOAD START ===')
    console.log('File:', file.name, file.size, 'bytes')
    console.log('Token exists:', !!token)
    
    setIsUploadingAvatar(true)
    try {
      const updatedUser = await UserService.updateAvatar(file, token)
      console.log('Settings avatar upload successful:', updatedUser)
      setAvatar(updatedUser.avatar || '')
      dispatch(updateUser({ avatar: updatedUser.avatar }))
    } catch (error) {
      console.error('=== SETTINGS AVATAR UPLOAD FAILED ===')
      console.error('Error:', error)
      setSaveMessage(error instanceof Error ? error.message : 'Failed to upload avatar')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      const updatedUser = await UserService.updateProfile(name, token)
      dispatch(updateUser({ 
        name: updatedUser.name, 
        avatar: updatedUser.avatar 
      }))
      setSaveMessage('Profile updated successfully')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Failed to update profile')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="settings-page">
      <DashboardNavbar />
      <main className="settings__content">
        <header className="settings__header">
          <button type="button" className="article__back" onClick={() => navigate('/dashboard')}>
            ← Back to feed
          </button>
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
        </header>
        <div className="settings__divider" />

        <div className="settings__sections">
          <section className="settings__section">
            <h2 className="settings__section-title">Profile Information</h2>
            <form className="settings__form" onSubmit={handleSaveProfile}>
              <div className="settings__form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="settings__form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="your@email.com"
                  disabled
                />
                <small className="settings__form-hint">Email cannot be changed</small>
              </div>

              <div className="settings__form-group">
                <label>Profile Picture</label>
                <div className="settings__avatar-upload">
                  {avatar ? (
                    <div className="settings__avatar-preview">
                      <img src={getAvatarUrl(avatar)} alt="Profile" className="settings__avatar-image" />
                      <button
                        type="button"
                        className="settings__remove-avatar-btn"
                        onClick={() => setAvatar('')}
                        disabled={isUploadingAvatar}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="settings__avatar-placeholder">
                      <span className="settings__avatar-initials">
                        {name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MV'}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleAvatarUpload(file)
                    }}
                    disabled={isUploadingAvatar}
                    className="settings__avatar-input"
                  />
                  <small className="settings__form-hint">Upload a profile picture (JPEG, PNG, GIF, WebP, max 5MB)</small>
                </div>
              </div>

            
              {saveMessage && (
                <div className="settings__message settings__message--success">
                  {saveMessage}
                </div>
              )}

              <button type="submit" className="settings__save-btn" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          <section className="settings__section">
            <h2 className="settings__section-title">Account Actions</h2>
            <div className="settings__actions">
              <button type="button" className="settings__action-btn settings__action-btn--danger" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
})
